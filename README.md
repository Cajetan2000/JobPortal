
Overview
JobPortal is a web-based application designed to streamline the job search process by allowing users to browse jobs, and upload their CVs, and analyze job matches seamlessly. The application features a modern, responsive design and leverages advanced AI(Gemini) to provide feedback based on users CV's and the provided job description.

Features
CV Upload: Users can upload their CVs directly to the platform.
CV Feedback: Advanced AI analyzes CVs and job descriptions to provide constructive feedback and suggest ways of improvement.
User Dashboard: A dashboard for managing jobs posted, tracking progress, and viewing recommended jobs.
Report Generation: A feature that allows user to generate a pdf of the report gotten when they upload their CV.
Read Aloud feature: That feature allows people with visual impairments to listen to the report as it;s being read to them by the system.
Job search, Post, and edit: This feature allows users to filter jobs, Post their own, and also edit or delete jobs they previously posted.

Technologies Used
Frontend: React, Tailwind CSS
Backend: Node.js, Express
Database: MongoDB
Hosting: Vercel
AI: Gemini

Getting Started
Prerequisites
Before you begin, ensure you have the following installed:

Node.js (v14 or higher)
MongoDB
Vercel CLI (for deployment)
Installation
Clone the repository:

bash
Copy code
git clone https://github.com/yourusername/job-portal.git
cd job-portal
Install dependencies:

bash
Copy code
npm install
Configure environment variables:

Create a .env file in the root directory and add your environment variables. Example:

bash
Copy code
MONGO_URI=mongodb://localhost:27017/jobportal
JWT_SECRET=your_jwt_secret
Run the application:

bash
Copy code
npm start
The application should now be running on http://localhost:3000.

Deployment
The application is hosted on Vercel. To deploy:

Build the application:

bash
Copy code
npm run build
Deploy to Vercel:

bash
Copy code
vercel --prod




