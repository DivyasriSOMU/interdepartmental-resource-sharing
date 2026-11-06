# Interdepartmental Planning & Resource Sharing Platform

## Project Overview

The Interdepartmental Planning & Resource Sharing Platform is a web application designed to help departments manage and share resources within an educational institution. It provides a centralized interface for students to request resources and administrators to manage departments, resources, and booking requests.

## Technologies Used

- **Frontend:** React, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JSON Web Tokens (JWT)
- **Password Security:** bcrypt

## Implemented Features

- User login and role-based access for students and administrators
- Department listing and management
- Resource listing and management
- Resource booking requests
- Detection of overlapping booking requests
- Alternative resource suggestions when conflicts are detected
- Administrator approval or rejection of pending requests
- Password hashing for secure password storage

## Project Structure

```text
InterDepartmentalPlatform/
├── client/       # React frontend
├── server/       # Express backend and API
├── package.json
├── package-lock.json
└── README.md
```

## Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB Community Server
- Visual Studio Code (recommended)

## Running the Project Locally

### 1. Start MongoDB

Ensure your local MongoDB server is running.

### 2. Start the backend

Open a terminal in VS Code:

```powershell
cd server
npm install
npm run dev
```

If `npm run dev` is not defined in `server/package.json`, use the start command configured in that file.

Configure the backend environment variables in `server/.env`. Do not upload this file to GitHub.

### 3. Start the frontend

Open a second terminal:

```powershell
cd client
npm install
npm run dev
```

Open the local frontend URL shown in the terminal, usually `http://localhost:5173`.

## Security Notes

- Environment files containing secrets must not be committed to GitHub.
- Passwords are hashed before storage.
- Protected API endpoints use JWT authentication and role-based authorization.

## Project Status

The application has been implemented and tested locally. The repository contains the project source code; a publicly hosted version of the application has not been specified.

## Author

- **Name:** [Your Name]
- **Department:** [Your Department]
- **Institution:** [Your College]
- **Academic Year:** [Your Academic Year]
