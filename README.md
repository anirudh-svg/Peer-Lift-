## PeerLift — Anonymous Mental Health Support Chat

PeerLift is a privacy-focused mental health support platform that connects users anonymously with peers for empathetic, non-judgmental conversations. It encourages open dialogue, emotional sharing, and community-driven healing — all without compromising personal identity.

## Tech Stack

Frontend: Vite + React

Backend: Convex (serverless real-time backend)

Auth: Convex Auth with Anonymous Sign-In

Deployment: Chef + Convex Hosting

## Project Structure
PeerLift/
│
├── app/          → Frontend source (React + Vite)
├── convex/       → Backend logic and API routes
├── .gitignore
├── README.md
└── package.json

## Getting Started

1. Clone the Repository

git clone https://github.com/<your-username>/PeerLift.git
cd PeerLift


2. Install Dependencies

npm install


3. Run the App

npm run dev


This command launches both the frontend and backend servers using Convex and Vite.

## Authentication

PeerLift currently uses Anonymous Auth for quick, barrier-free sign-in.
You can switch to email or OAuth authentication via Convex Auth
 for production deployments.

## Deployment

You can deploy the app using Chef
 and Convex Hosting
.
Follow Convex’s Hosting and Deployment Guide
 for environment configuration and secrets management.

💡 Future Enhancements

Mood journaling and sentiment tracking

Community support groups

Integration with licensed therapists (via role-based chat access)

AI-assisted emotional support (moderated and privacy-safe)

## License

This project is open-sourced under the MIT License
