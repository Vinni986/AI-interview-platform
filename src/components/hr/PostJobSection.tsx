import React, { useState, FormEvent, ChangeEvent, ReactElement } from "react";
import { toast } from "sonner";
import apiService from "../../services/api";

interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  location: string;
  jd: string;
  role: string;
}

interface FormStatus {
  type: "idle" | "loading" | "success" | "error";
  message?: string;
}

export default function JobApplicationForm(): ReactElement {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    location: "",
    jd: "",
    role: "",
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [status, setStatus] = useState<FormStatus>({ type: "idle" });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] || null;
    
    // Validate file size (10MB limit)
    if (file && file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      e.target.value = ""; // Reset input
      return;
    }

    // Validate file type
    if (file && file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      e.target.value = ""; // Reset input
      return;
    }

    setCvFile(file);
  };

  const resetForm = (): void => {
    setFormData({
      fullName: "",
      email: "",
      phoneNumber: "",
      location: "",
      jd: "",
      role: "",
    });
    setCvFile(null);
    
    // Reset file input
    const fileInput = document.getElementById("cv") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setStatus({ type: "loading" });

    // Validation
    if (!cvFile) {
      setStatus({ type: "error", message: "Please upload your CV." });
      toast.error("Please upload your CV");
      return;
    }

    if (!formData.jd.trim()) {
      setStatus({ type: "error", message: "Please enter the job description." });
      toast.error("Please enter the job description");
      return;
    }

    try {
      // ✅ Pass all fields including jd and location
      const response = await apiService.submitJobApplication({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phoneNumber,
        role: formData.role,
        location: formData.location,  // ✅ ADD LOCATION
        jd: formData.jd,              // ✅ ADD JD
        cvFile: cvFile,
      });

      // ✅ Handle "Workflow was started" response as success
      const isSuccess = 
        response?.success || 
        response?.jd_hash || 
        (typeof response === 'object' && response !== null);

      if (isSuccess) {
        setStatus({
          type: "success",
          message: "Application submitted successfully!",
        });
        toast.success("Application submitted successfully!");
        console.log("✅ Submission successful:", response);
        
        // Optional: Log JD hash if returned
        if (response?.jd_hash) {
          console.log("✅ JD Hash:", response.jd_hash);
        }

        resetForm();
      } else {
        throw new Error(response?.message || "Submission failed");
      }
    } catch (error: any) {
      console.error("❌ Submission Error:", error);
      
      // ✅ Check if "Workflow was started" is in error message - that's actually SUCCESS
      if (error?.message?.includes("Workflow was started")) {
        setStatus({
          type: "success",
          message: "Application submitted successfully!",
        });
        toast.success("Application submitted successfully!");
        resetForm();
        return;
      }
      
      const errorMessage = 
        error?.message || 
        "Network error. Please check your connection and try again.";
      
      setStatus({
        type: "error",
        message: errorMessage,
      });
      toast.error(errorMessage);
    }
  };

  const isLoading = status.type === "loading";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Job Application</h1>
          <p className="text-gray-600 mt-2">
            Submit your application and take the next step in your career
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">
            Application Form
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            Fill in your details and upload your CV below. All fields are
            required.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block font-medium text-gray-700 mb-1"
              >
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block font-medium text-gray-700 mb-1"
              >
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter your email"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block font-medium text-gray-700 mb-1"
              >
                Phone Number *
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                pattern="[0-9]{10}"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="10-digit phone number"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter 10-digit phone number without spaces or dashes
              </p>
            </div>

            {/* CV Upload */}
            <div>
              <label
                htmlFor="cv"
                className="block font-medium text-gray-700 mb-1"
              >
                Upload CV (PDF Only) *
              </label>
              <input
                type="file"
                id="cv"
                name="cv"
                accept="application/pdf"
                onChange={handleFileChange}
                required
                disabled={isLoading}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  Maximum file size: 10MB
                </p>
                {cvFile && (
                  <p className="text-xs text-green-600 font-medium">
                    ✓ {cvFile.name} ({(cvFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="block font-medium text-gray-700 mb-1"
              >
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="City/State"
              />
            </div>

            {/* Job Description */}
            <div>
              <label
                htmlFor="jd"
                className="block font-medium text-gray-700 mb-1"
              >
                Job Description *
              </label>
              <textarea
                id="jd"
                name="jd"
                value={formData.jd}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                rows={6}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter the job description"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.jd.length} characters
              </p>
            </div>

            {/* Role */}
            <div>
              <label
                htmlFor="role"
                className="block font-medium text-gray-700 mb-1"
              >
                Role *
              </label>
              <input
                type="text"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Example: Software Engineer"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <span>{isLoading ? "Submitting..." : "Submit Application"}</span>
              {isLoading && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
            </button>
          </form>

          {/* Success Message */}
          {status.type === "success" && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-fadeIn">
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-green-600 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="font-semibold text-green-800">
                    Application Submitted!
                  </p>
                  <p className="text-green-700 text-sm">
                    Thank you for your application. We'll get back to you soon.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {status.type === "error" && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-red-600 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="font-semibold text-red-800">Submission Failed</p>
                  <p className="text-red-700 text-sm">
                    {status.message ||
                      "Something went wrong. Please try again."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          🔒 Your data is secure and will only be used for recruitment purposes.
        </p>
      </div>

      {/* Add animation styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}