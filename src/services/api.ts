import config from '../config';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.api.baseUrl;
    
    if (!this.baseUrl) {
      console.error('❌ API base URL not configured');
    }
  }

  /**
 * Generic request handler with conditional logging
 */
private async request(endpoint: string, options?: RequestInit): Promise<any> {
  const url = `${this.baseUrl}${endpoint}`;
  const isDev = (import.meta as any).env?.DEV ?? false; // Vite's built-in dev mode check
  
  // Only log in development
  if (isDev) {
    console.log(`🔗 ${options?.method || 'GET'} ${url}`);
  }
  
  try {
    const response = await fetch(url, options);
    
    if (isDev) {
      console.log(`📡 Status: ${response.status}`);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      const text = await response.text();
      
      if (!text || text.trim() === '') {
        if (isDev) {
          console.warn('⚠️ Empty response');
        }
        return { success: false, message: 'Empty response from server' };
      }

      return JSON.parse(text);
    }

    return response;
    
  } catch (error) {
    // Always log errors (even in production)
    console.error(`❌ API Error [${endpoint}]:`, error);
    throw error;
  }
}
  // ========================================
// JOB APPLICATION
// ========================================

/**
 * Submit job application with CV
 */
async submitJobApplication(params: {
  name: string;
  email: string;
  phone: string;
  role?: string;
  jd?: string;
  location?: string;
  cvFile: File;
}): Promise<any> {
  const queryParams = new URLSearchParams({
    name: params.name,
    email: params.email,
    phone: params.phone,
    ...(params.role && { role: params.role }),
    ...(params.jd && { jd: params.jd }), // ✅ ADD JD
    ...(params.location && { location: params.location }), // ✅ ADD LOCATION
  });

  const formData = new FormData();
  formData.append('cv', params.cvFile);

  return this.request(`/job-application?${queryParams.toString()}`, {
    method: 'POST',
    body: formData,
  });
}

/**
 * Submit generic form
 */
async submitForm(formData: FormData, formId: string): Promise<any> {
  return this.request(`/form/${formId}`, {
    method: 'POST',
    body: formData,
  });
}
  // ========================================
  // INTERVIEW SESSION
  // ========================================

  /**
   * Get interview session details
   */
  async getInterviewSession(eventId: string, email: string): Promise<any> {
    return this.request(`/get-interview-session?eventId=${eventId}&email=${email}`);
  }

  // ========================================
  // QUESTIONS
  // ========================================

  /**
   * Get all questions
   */
  async getQuestionsList(): Promise<any> {
    return this.request('/questions-list');
  }

  /**
   * Get questions by JD hash
   */
  async getQuestions(jdHash: string): Promise<any> {
    return this.request(`/get-interview-questions?jd_hash=${jdHash}`);
  }

  /**
   * Add new question
   */
  async addQuestion(data: {
    jd_hash: string;
    role: string;
    question: string;
    hr_answer?: string;
  }): Promise<any> {
    return this.request('/questions-add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * Update question
   */
  async updateQuestion(data: {
    id: number;
    jd_hash?: string;
    role?: string;
    question?: string;
    hr_answer?: string;
  }): Promise<any> {
    return this.request('/questions-update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  // ========================================
  // RESULTS
  // ========================================

  /**
   * Get all interview results
   */
  async getResultsList(): Promise<any> {
    return this.request('/results-list');
  }

  /**
   * Submit answer for evaluation
   */
  async evaluateAnswer(data: {
    candidateEmail: string;
    candidateName?: string;
    question: string;
    answer?: string;
    jdHash: string;
    role?: string;
    audioBlob?: Blob;
  }): Promise<any> {
    const formData = new FormData();
    
    if (data.audioBlob) {
      formData.append('file', data.audioBlob, 'answer.webm');
    }
    
    formData.append('candidate_email', data.candidateEmail);
    formData.append('question', data.question);
    formData.append('jd_hash', data.jdHash);
    
    if (data.candidateName) {
      formData.append('candidate_name', data.candidateName);
    }
    
    if (data.answer) {
      formData.append('answer', data.answer);
    }
    
    if (data.role) {
      formData.append('role', data.role);
    }

    return this.request('/evaluate-answer', {
      method: 'POST',
      body: formData,
    });
  }

  // ========================================
  // EMAIL STATUS
  // ========================================

  /**
   * Get email logs and status
   */
  async getEmailStatus(): Promise<any> {
    return this.request('/email-status');
  }

  // ========================================
  // DASHBOARD
  // ========================================

  /**
   * Load all dashboard data at once
   */
  async getDashboardData(): Promise<{
    results: any;
    emails: any;
    questions: any;
  }> {
    const [results, emails, questions] = await Promise.all([
      this.getResultsList(),
      this.getEmailStatus(),
      this.getQuestionsList(),
    ]);

    return { results, emails, questions };
  }

  // ========================================
  // UTILITY
  // ========================================

  /**
   * Check if API is configured
   */
  isConfigured(): boolean {
    return !!this.baseUrl;
  }

  /**
   * Get base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// Export singleton instance
export default new ApiService();