import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Mic, MicOff, Volume2, CheckCircle } from 'lucide-react';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';

interface VoiceInterviewInterfaceProps {
  candidateName: string;
  onComplete: () => void;
}

const mockQuestions = [
  'Explain your experience with REST APIs and how you\'ve implemented them in previous projects.',
  'What is polymorphism in Object-Oriented Programming and can you provide a practical example?',
  'How do you manage deadlines when working on large-scale projects with multiple dependencies?',
  'Describe a time when you solved a complex technical challenge. What was your approach?',
  'What version control tools and workflows do you use? Explain your branching strategy.'
];

export default function VoiceInterviewInterface({ candidateName, onComplete }: VoiceInterviewInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [candidateTranscript, setCandidateTranscript] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / mockQuestions.length) * 100;

  useEffect(() => {
    // Simulate AI speaking the first question
    simulateAISpeaking();
  }, [currentQuestionIndex]);

  const simulateAISpeaking = () => {
    setIsAISpeaking(true);
    setTimeout(() => {
      setIsAISpeaking(false);
      // Auto-start recording after AI finishes
      setTimeout(() => {
        setIsRecording(true);
      }, 500);
    }, 2000);
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    
    // Simulate processing answer
    toast.success('Answer recorded');
    
    // Mock transcript
    setCandidateTranscript('This is a simulated transcript of the candidate\'s response...');

    // Submit answer to backend
    await submitAnswer();

    // Move to next question or complete
    setTimeout(() => {
      if (currentQuestionIndex < mockQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCandidateTranscript('');
      } else {
        setIsComplete(true);
        toast.success('Interview completed! Thank you.');
      }
    }, 2000);
  };

  const submitAnswer = async () => {
    // In production, this would POST to /api/interview/evaluate-answer
    // or directly to https://n8n.pseudoclan.com/webhook/evaluate-answer
    
    const payload = {
      candidate_name: candidateName,
      candidate_email: 'candidate@example.com',
      role: 'Frontend Developer',
      jd_hash: 'abc1234',
      question: currentQuestion,
      answer: candidateTranscript || 'Simulated answer text...'
    };

    // Mock API call
    console.log('Submitting answer:', payload);
  };

  if (isComplete) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-gray-900 mb-4">Interview Completed!</h2>
          <p className="text-gray-600 mb-8">
            Thank you for completing the interview. Your responses have been recorded and will be evaluated by our team. 
            We'll contact you soon with the results.
          </p>
          <Button onClick={onComplete} className="bg-blue-600 hover:bg-blue-700">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700">
            Question {currentQuestionIndex + 1} of {mockQuestions.length}
          </span>
          <span className="text-gray-600">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* AI Question Panel */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${isAISpeaking ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <Volume2 className={`w-6 h-6 ${isAISpeaking ? 'text-blue-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <h3 className="text-gray-900">AI Interviewer</h3>
              <p className="text-gray-600">
                {isAISpeaking ? 'Speaking...' : 'Listening'}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-900">{currentQuestion}</p>
          </div>

          {isAISpeaking && <Waveform />}
        </div>

        {/* Candidate Response Panel */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${isRecording ? 'bg-red-100' : 'bg-gray-100'}`}>
              {isRecording ? (
                <Mic className="w-6 h-6 text-red-600" />
              ) : (
                <MicOff className="w-6 h-6 text-gray-600" />
              )}
            </div>
            <div>
              <h3 className="text-gray-900">Your Response</h3>
              <p className="text-gray-600">
                {isRecording ? 'Recording...' : 'Ready'}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 min-h-[120px]">
            {candidateTranscript ? (
              <p className="text-gray-900">{candidateTranscript}</p>
            ) : (
              <p className="text-gray-400 italic">
                {isRecording ? 'Speak your answer...' : 'Waiting to start...'}
              </p>
            )}
          </div>

          {isRecording && (
            <>
              <RecordingAnimation />
              <Button 
                onClick={handleStopRecording}
                className="w-full bg-red-600 hover:bg-red-700 mt-4"
              >
                Stop Recording
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-gray-600 text-center">
          💡 <strong>Tip:</strong> Take a moment to organize your thoughts before speaking. 
          The AI will wait for you to finish before moving to the next question.
        </p>
      </div>
    </div>
  );
}

function Waveform() {
  return (
    <div className="flex items-center justify-center gap-1 h-16">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-blue-500 rounded-full animate-pulse"
          style={{
            height: `${Math.random() * 40 + 20}px`,
            animationDelay: `${i * 50}ms`,
          }}
        />
      ))}
    </div>
  );
}

function RecordingAnimation() {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
      <span className="text-red-600">Recording in progress...</span>
    </div>
  );
}
