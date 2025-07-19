#Secure-Email-Communication

A secure email communication system that protects sensitive messages using encryption and digital signatures. Built with a focus on privacy, the platform ensures messages remain confidential and tamper-proof during transmission.

#Features

End-to-end email encryption

Digital signature verification

User authentication with secure key handling

Frontend and backend fully containerized with Docker

Simple and secure interface for sending and receiving emails

#Run with Docker

```bash
git clone https://github.com/Sawhun/Secure-Email-Communication.git
cd Secure-Email-Communication
npm install concurrently --save-dev
docker-compose up --build
```

> ⚠️ Make sure Docker and Docker Compose are installed on your system.


#Technologies Used

Frontend: React.js

Backend: Node.js, Express.js

Security: Crypto libraries for AES encryption and RSA digital signatures

Containerization: Docker, Docker Compose

#Folder Structure

```
Secure-Email-Communication-Systerm/
├── backend/          # Node.js backend API
├── frontend/         # React frontend
├── docker-compose.yml
└── README.md
```
