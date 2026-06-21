# 🚀 DSA Pattern Tracker AI

A premium, gamified platform designed to help developers master Data Structures & Algorithms (DSA) through structured pattern tracking, interactive progress indicators, and personalized **AI Mentorship**.

---

## ✨ Features

- **🧠 AI Mentor:** Powered by Groq API (`llama-3.3-70b-versatile`) to generate customized coding roadmaps, offer step-by-step guidance, and review code solutions.
- **🎮 Gamified Progression:** Earn XP (Experience Points), level up, and unlock achievements/badges as you solve coding problems.
- **🔥 Streaks Tracker:** Track and maintain your daily consistency streaks with dynamic streak modifiers.
- **🎯 Company Prep Roadmaps:** Target popular interview questions from tech giants like **Google**, **Amazon**, **Meta**, **Microsoft**, **Walmart**, and **Adobe**.
- **🔐 Google Sign-In:** Secure authentication using Google OAuth 2.0 with automatic registration and database creation.
- **💎 Premium Dark UI:** An interface featuring glassmorphic designs, harmonious colors, custom animations, and responsive panels.

---

## 🛠️ Tech Stack

### Frontend
- **Core:** React (Vite)
- **Styling:** Tailwind CSS & Vanilla CSS (Custom Glassmorphism)
- **Icons:** Lucide React
- **HTTP Client:** Axios

### Backend
- **Core:** Node.js, Express
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Authentication:** JSON Web Tokens (JWT) & Google OAuth 2.0 (`google-auth-library`)
- **AI Integrations:** Groq API (Completions Client)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- A MongoDB Atlas Database cluster
- A Groq API Key (Optional — falls back to static seed data if not provided)
- A Google OAuth Client ID (Optional — falls back to mock login in development if not provided)

### 1. Repository Setup & Installation
Clone the repository and install all dependencies for both the frontend and backend using the root setup utility:
```bash
npm run install-all
```

### 2. Environment Variables configuration

#### Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_groq_api_key
GOOGLE_CLIENT_ID=your_google_client_id_here
```

#### Frontend (`frontend/.env.local`)
Create a `.env.local` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 3. Database Seeding
To seed the database with the initial set of 72 curated DSA questions:
```bash
npm run seed
```

### 4. Running Locally
Start both the backend server and frontend Vite server concurrently with a single command from the root directory:
```bash
npm run dev
```
The application will run locally at **`http://localhost:5173`**.

---

## 📦 Deployment Guide

### Frontend (Vercel)
1. Import your repository into **Vercel**.
2. Set the **Root Directory** to `frontend`.
3. Add the environment variable `VITE_API_URL` pointing to your Render backend API URL (e.g. `https://your-app.onrender.com/api`).
4. Add the environment variable `VITE_GOOGLE_CLIENT_ID` with your Google OAuth client ID.
5. Click **Deploy**.

### Backend (Render)
1. Import your repository into **Render** as a **Web Service**.
2. Set the **Root Directory** to `backend`.
3. Set the Build Command to `npm install` and Start Command to `node server.js`.
4. Under Environment Variables, add your `MONGO_URI`, `JWT_SECRET`, `GROQ_API_KEY`, `GOOGLE_CLIENT_ID`, and `PORT` (e.g. `5000`).
5. Click **Create Web Service**.

---

## 🔗 Live Application Links

- **Live Web Application:** [https://dsa-tracker-jp.vercel.app](https://dsa-tracker-jp.vercel.app)
- **Backend API Server:** [https://dsa-tracker-ai.onrender.com](https://dsa-tracker-ai.onrender.com)

