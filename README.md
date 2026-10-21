# Interdepartmental Planning & Resource Sharing Platform

## Project Overview

The Interdepartmental Planning & Resource Sharing Platform is a web application that helps educational departments manage and share resources. Students can submit resource booking requests, while administrators can manage departments, resources, and booking approvals.

## Technologies Used

- React and Vite
- Node.js and Express.js
- MongoDB
- JSON Web Tokens (JWT)
- bcrypt for password hashing

## Features

- Student and administrator login
- Role-based access control
- Department management
- Resource management
- Resource booking requests
- Booking conflict detection
- Alternative resource suggestions
- Administrator approval and rejection of requests

## Project Structure

- `client/` — React frontend
- `server/` — Express backend and API
- `README.md` — Project documentation

## Requirements

- Node.js and npm
- MongoDB Community Server
- Visual Studio Code (recommended)

## Running Locally

### Backend

Open a terminal and run:

```powershell
cd server
npm install
npm run dev
```

Use the start command configured in `server/package.json` if `npm run dev` is unavailable. Configure the required environment variables in `server/.env`.

### Frontend

Open a second terminal from the project root and run:

```powershell
cd client
npm install
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173`.

## Security

- Passwords are hashed before storage.
- Protected API endpoints use JWT authentication and role-based authorization.
- Environment files containing secrets should not be uploaded to GitHub.

## Author Details

- Name: [Your Name]
- Department: [Your Department]
- College: [Your College]
- Academic Year: [Your Academic Year]
