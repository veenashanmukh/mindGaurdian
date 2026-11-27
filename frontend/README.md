🧠 MindGuardian – Proactive Mental Wellness Companion (Prototype)

MindGuardian is a permission-light mental wellness app designed to identify early signs of stress and provide gentle, low-effort support without requiring emotional labeling, journaling, or constant self-reporting.

This repository contains the Round 2 MVP prototype built for the GDG Open Innovation Hackathon.

🚀 What This Prototype Demonstrates

Situational, behavior-based personalization (not emotion labels)

A complete user flow: onboarding → check-in → dashboard

Adaptive support suggestions based on user energy and patterns

Privacy-first design with optional enhancements

Clean architecture suitable for future scaling

This is a functional prototype, not a production system.

🧩 Core Features Implemented (MVP Scope)

Onboarding Flow – collects basic user info (name, age)

Situational Check-ins – users respond to everyday scenarios

Adaptive Dashboard – shows a daily balance score and suggestions

Calming Intervention – one working breathing-based activity

Permission-Light Design – app works without voice, wearables, or tracking

(Some advanced features are mocked or represented conceptually.)

🏗️ Tech Stack Used
Frontend

React (UI framework)

Vite (fast development & bundling)

React Router (navigation)

Google / Cloud Tools (Planned & Partially Integrated)

Firebase (Authentication, Firestore – planned for next iteration)

Architecture supports future integration with Google ML Kit

📁 Project Structure (Simplified)
frontend/
 
    └── src/
     
     ├── pages/        # App screens (Onboarding, Dashboard, etc.)
     
     ├── components/   # Reusable UI & features
     
     ├── logic/        # Prototype inference & personalization logic
     
     ├── assets/       # Icons, sounds
     
     └── services/     # Firebase & app services

▶️ How to Run the Project Locally
Prerequisites

Node.js (LTS)

Git

VS Code (recommended)

Steps
git clone <repo-url>
cd mindGuardian/frontend
npm install
npm run dev


Open in browser:

http://localhost:5173/

⚠️ Note

This is an MVP prototype, not a full app

Logic is rule-based for demonstration

No datasets or ML training are included at this stage

Focus is on flow, UX, and concept clarity

🌱 Future Scope (Not Required for Round 2)

Mobile-native build

Firebase Authentication & Analytics

On-device ML (stress inference)

Wearable integration

Advanced personalization

👥 Team Collaboration

All dependencies are managed via npm

Do NOT commit node_modules

Keep commits small and descriptive

📌 One-line Summary

MindGuardian quietly learns from user behavior and provides timely support—without forcing emotional disclosure.
