import React, { useState } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Upload, FileCheck, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '../services/api';

interface ApplicationFormProps {
  isHRSubmission?: boolean;
}

export default function ApplicationForm({ isHRSubmission = false }: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    location: '',
    role: '',
    jd: '',
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [jdHash, setJdHash] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      e.target.value = ''; // Reset input
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      e.target.value = ''; // Reset input
      return;
    }

    setCvFile(file);
    toast.success('CV uploaded successfully');
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      location: '',
      role: '',
      jd: '',
    });
    setCvFile(null);
    setCoverLetter('');
    setJdHash(null);

    // Reset file input
    const fileInput = document.getElementById('cv') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!cvFile) {
      toast.error('Please upload your CV');
      return;
    }

    if (isHRSubmission && !formData.jd.trim()) {
      toast.error("JD is required for HR submission");
      return;
    }

    setLoading(true);

    try {
      // Prepare form data
      const fd = new FormData();
      
      // EXACT n8n FIELD NAMES (matching your existing workflow)
      fd.append("Full Name", formData.fullName);
      fd.append("Email", formData.email);
      fd.append("Phone Number", formData.phoneNumber);
      fd.append("Location", formData.location);
      fd.append("role", formData.role);
      // ✅ ALWAYS APPEND JD
      fd.append("jd", formData.jd);
      fd.append("Cv", cvFile);

      // Optional: include cover letter
      if (coverLetter.trim()) {
        fd.append("coverLetter", coverLetter);
      }

      // ✅ Use submitForm (which sends FormData) - NOT submitJobApplication
      const data = await apiService.submitForm(
        fd, 
        "8baa0e05-8b0b-4e9a-a953-9a32e875a3aa" // Your n8n form ID
      );

      // Handle response
      if (data.jd_hash) {
        setJdHash(data.jd_hash);
        toast.success("Application submitted successfully!");
        console.log("✅ JD Hash:", data.jd_hash);
      } else if (data.success) {
        toast.success("Application submitted successfully!");
      } else {
        toast.success("Submitted successfully — workflow triggered");
      }

      // Reset form after successful submission
      setTimeout(resetForm, 2000); // Give user time to see success message

    } catch (error: any) {
      console.error("❌ Submission error:", error);
      toast.error(error.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* NAME + EMAIL */}
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="fullName">Full Name *</Label>
          <Input 
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
            disabled={loading}
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input 
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={loading}
            placeholder="your.email@example.com"
          />
        </div>
      </div>

      {/* PHONE + LOCATION */}
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="phoneNumber">Phone Number *</Label>
          <Input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            required
            disabled={loading}
            placeholder="10-digit number"
            pattern="[0-9]{10}"
          />
        </div>

        <div>
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
            disabled={loading}
            placeholder="City, State"
          />
        </div>
      </div>

      {/* ROLE */}
      <div>
        <Label htmlFor="role">Role / Job Title *</Label>
        <Input
          id="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          required
          disabled={loading}
          placeholder="e.g., Software Engineer"
        />
      </div>

      {/* CV UPLOAD */}
      <div>
        <Label htmlFor="cv">Upload CV (PDF only) *</Label>
        <label
          htmlFor="cv"
          className={`flex items-center justify-center w-full px-4 py-8 border-2 border-dashed 
                     rounded-lg transition-all ${
                       loading 
                         ? 'cursor-not-allowed bg-gray-50 border-gray-300' 
                         : 'cursor-pointer hover:border-blue-500 hover:bg-blue-50'
                     } ${cvFile ? 'border-green-400 bg-green-50' : 'border-gray-300'}`}
        >
          {cvFile ? (
            <div className="flex items-center gap-3 text-green-600">
              <FileCheck className="w-6 h-6" />
              <div>
                <p className="font-medium">{cvFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(cvFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-gray-600">
              <Upload className="w-8 h-8 mb-2" />
              <p className="font-medium">Click to upload CV</p>
              <p className="text-sm text-gray-500 mt-1">PDF only, max 5MB</p>
            </div>
          )}
        </label>
        <input
          id="cv"
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleFileChange}
          required
          disabled={loading}
        />
      </div>

      {/* JD - ALWAYS SHOW (not conditional) */}
      <div>
        <Label htmlFor="jd">Job Description {isHRSubmission ? '*' : '(Optional)'}</Label>
        <Textarea
          id="jd"
          value={formData.jd}
          onChange={(e) => setFormData({ ...formData, jd: e.target.value })}
          required={isHRSubmission}
          disabled={loading}
          className="min-h-[120px]"
          placeholder="Paste the complete job description here..."
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.jd.length} characters
        </p>
      </div>

      {/* OPTIONAL COVER LETTER */}
      <div>
        <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
        <Textarea
          id="coverLetter"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          disabled={loading}
          className="min-h-[120px]"
          placeholder="Tell us why you're a great fit for this role..."
        />
        {coverLetter && (
          <p className="text-xs text-gray-500 mt-1">
            {coverLetter.length} characters
          </p>
        )}
      </div>

      {/* SUBMIT BUTTON */}
      <Button 
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed h-12 text-base font-semibold"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing Application...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 mr-2" />
            Submit Application
          </>
        )}
      </Button>

      {/* SUCCESS MESSAGE */}
      {jdHash && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-green-900 mb-1">
                ✓ Application Submitted Successfully!
              </p>
              <p className="text-green-700 text-sm mb-2">
                Your application has been received and is being processed.
              </p>
              <div className="bg-white border border-green-200 rounded p-2 font-mono text-xs text-green-800">
                JD Hash: <span className="font-semibold">{jdHash}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INFO */}
      <p className="text-center text-sm text-gray-500">
        🔒 All information is encrypted and stored securely
      </p>

      {/* Add animation styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </form>
  );
}