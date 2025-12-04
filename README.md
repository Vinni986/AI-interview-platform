# AI-interview-platform

> Automate your recruitment process with AI voice interviews, intelligent CV screening, and real-time candidate evaluation.

## 📖 Overview

This AI-powered interview system revolutionizes the hiring process by combining voice AI technology with automated workflow management. Candidates can submit applications, undergo AI-conducted voice interviews, and receive automated feedback—all without human intervention in the initial screening stages.

**Key Highlights:**
- 🎙️ Real-time AI voice conversations using ElevenLabs
- 📄 Automated CV parsing and JD matching
- 🔄 End-to-end workflow automation with n8n
- 🎨 Modern, responsive UI built with React & TypeScript
- 🔒 Secure file handling and data privacy
<img width="1905" height="892" alt="Screenshot from 2025-12-04 21-29-00" src="https://github.com/user-attachments/assets/1267e419-c684-43c4-a7d1-70f9ae66193f" />



---

## ✨ Features

### 🤖 AI Voice Interviews
- Natural conversational AI powered by ElevenLabs
- Real-time speech recognition and response
- Dynamic follow-up questions based on candidate answers
- Live transcription and session recording
- Split-screen interview interface
<img width="1442" height="811" alt="Screenshot from 2025-12-04 02-28-47" src="https://github.com/user-attachments/assets/a33b5587-2317-44e7-9c9a-0cae2b6a6c17" />


### 📋 Smart Application Processing
- PDF CV upload with validation (type, size limits)
- Automated skill extraction and matching
- Job description analysis and relevance scoring
- Email notifications and confirmations
- Interview link generation

### 🎯 Candidate Experience
- Clean, intuitive application form
- Mobile-responsive design
- Real-time status updates
- Toast notifications for user feedback
- Microphone permission handling

### 🔧 Admin Capabilities
- HR submission portal
- Automated candidate scoring
- Interview recordings and transcripts
- Integration with existing HR tools via n8n
- Customizable evaluation criteria
- <img width="1905" height="892" alt="Screenshot from 2025-12-04 21-24-36" src="https://github.com/user-attachments/assets/de795887-b4bd-4cb1-8d1a-ef7995eaed29" />
<img width="1905" height="892" alt="Screenshot from 2025-12-04 21-24-17" src="https://github.com/user-attachments/assets/8992c67b-78f8-41af-85da-7be26caf578b" />



<img width="1905" height="892" alt="Screenshot from 2025-12-04 21-26-26" src="https://github.com/user-attachments/assets/2594123f-3256-47f3-a40d-89c65c9d0911" />


---

## 🛠️ Tech Stack

### Frontend
React 18.x - UI Framework
TypeScript - Type Safety
React Router v6 - Client-side Routing
Tailwind CSS - Styling
Lucide React - Icon Library
Sonner - Toast Notifications

### AI & Backend
ElevenLabs API - Conversational AI
n8n - Workflow Automation
REST APIs - Data Communication
WebRTC - Real-time Audio

### Configuration

ElevenLabs Setup
Create a Conversational AI Agent

Visit ElevenLabs Dashboard
Click "Create New Agent"
Configure agent personality (e.g., "Professional HR Interviewer")
Add interview questions and conversation flow
Copy the Agent ID
Update configuration

TypeScript

elevenLabs: {
  agentId: 'agent_xxxxxxxxxxxxxxxx', // Paste your Agent ID
}
