# VedaAI 🚀

**AI-Powered Assignment & Assessment Platform** — *Where Ancient Wisdom Meets Modern Intelligence*

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express)](https://expressjs.com)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-8E75F2?style=for-the-badge&logo=google)](https://ai.google.dev)

A modern full-stack educational platform that automates assignment creation, submission, grading, and feedback using **Google Gemini AI**. Designed for teachers and institutions to scale quality education effortlessly.

---

## ✨ Features

### For Educators
- **Smart Assignment Creation** — Generate rich assignments with AI
- **Automated Grading** — AI-powered evaluation with detailed feedback
- **Bulk PDF Processing** — Upload and process multiple student submissions
- **Real-time Analytics** — Performance tracking and learning gap identification
- **Class Management** — Organize students and assignments efficiently

### For Students
- **Seamless Submission** — Drag & drop PDF uploads
- **Instant Feedback** — Get AI-generated insights on submissions
- **Progress Dashboard** — Track your academic growth

### Technical Highlights
- **Production-grade Architecture** with queue-based processing
- **Scalable AI Integration** using Google Generative AI (Gemini)
- **Modern Tech Stack** with best practices
- **Real-time Updates** via WebSockets
- **Robust Error Handling & Type Safety**

---

## 🛠 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18** + TypeScript
- **Tailwind CSS** + shadcn/ui
- **Zustand** (State Management)
- **React Hook Form** + Zod Validation
- **Lucide React** (Icons)

### Backend
- **Node.js** + **Express.js**
- **TypeScript**
- **MongoDB** + Mongoose
- **Google Generative AI** (Gemini)
- **BullMQ** + **Redis** (Background Jobs)
- **Multer** + PDF Parsing
- **WebSocket** support

### DevOps & Tools
- Turborepo-style monorepo structure
- ESLint + TypeScript strict mode
- Environment-based configuration

---

## 📁 Project Structure

```bash
veda-ai/
├── frontend/                 # Next.js Application
│   ├── src/
│   │   ├── app/             # App Router
│   │   ├── components/
│   │   ├── lib/
│   │   └── store/           # Zustand stores
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/                  # Express Server
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/        # AI, PDF processing, etc.
│   │   ├── models/
│   │   ├── queues/          # BullMQ workers
│   │   └── utils/
│   ├── package.json
│   └── tsconfig.json
│
└── README.md

Give sota level readme code for https://github.com/Aahant0607/veda-ai.gitSOTA-level README.md for your veda-ai repository:
Markdown# VedaAI 🚀

**AI-Powered Assignment & Assessment Platform** — *Where Ancient Wisdom Meets Modern Intelligence*

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express)](https://expressjs.com)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-8E75F2?style=for-the-badge&logo=google)](https://ai.google.dev)

A modern full-stack educational platform that automates assignment creation, submission, grading, and feedback using **Google Gemini AI**. Designed for teachers and institutions to scale quality education effortlessly.

---

## ✨ Features

### For Educators
- **Smart Assignment Creation** — Generate rich assignments with AI
- **Automated Grading** — AI-powered evaluation with detailed feedback
- **Bulk PDF Processing** — Upload and process multiple student submissions
- **Real-time Analytics** — Performance tracking and learning gap identification
- **Class Management** — Organize students and assignments efficiently

### For Students
- **Seamless Submission** — Drag & drop PDF uploads
- **Instant Feedback** — Get AI-generated insights on submissions
- **Progress Dashboard** — Track your academic growth

### Technical Highlights
- **Production-grade Architecture** with queue-based processing
- **Scalable AI Integration** using Google Generative AI (Gemini)
- **Modern Tech Stack** with best practices
- **Real-time Updates** via WebSockets
- **Robust Error Handling & Type Safety**

---

## 🛠 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18** + TypeScript
- **Tailwind CSS** + shadcn/ui
- **Zustand** (State Management)
- **React Hook Form** + Zod Validation
- **Lucide React** (Icons)

### Backend
- **Node.js** + **Express.js**
- **TypeScript**
- **MongoDB** + Mongoose
- **Google Generative AI** (Gemini)
- **BullMQ** + **Redis** (Background Jobs)
- **Multer** + PDF Parsing
- **WebSocket** support

### DevOps & Tools
- Turborepo-style monorepo structure
- ESLint + TypeScript strict mode
- Environment-based configuration

---

## 📁 Project Structure

```bash
veda-ai/
├── frontend/                 # Next.js Application
│   ├── src/
│   │   ├── app/             # App Router
│   │   ├── components/
│   │   ├── lib/
│   │   └── store/           # Zustand stores
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/                  # Express Server
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/        # AI, PDF processing, etc.
│   │   ├── models/
│   │   ├── queues/          # BullMQ workers
│   │   └── utils/
│   ├── package.json
│   └── tsconfig.json
│
└── README.md

🚀 Quick Start
Prerequisites

Node.js 18+
MongoDB
Redis
Google Gemini API Key

1. Clone the Repository
Bashgit clone https://github.com/Aahant0607/veda-ai.git
cd veda-ai
2. Backend Setup
Bashcd backend
cp .env.example .env
npm install
npm run dev
3. Frontend Setup
Bashcd frontend
cp .env.example .env.local
npm install
npm run dev
