# Charging Station Backend API

## Overview
Node.js backend for managing EV charging stations using Express.js and MongoDB.

## Features
- User authentication (register, login, profile management, password reset)
- Charging station CRUD operations
- Swagger API documentation
- JWT-based security and input validation

## Prerequisites
- Node.js (v14+)
- MongoDB
- npm

## Installation
1. Clone repo: `git clone <repository-url>`
2. Navigate to folder: `cd Backend`
3. Install dependencies: `npm install`
4. Create `.env` file:
   ```bash
   MONGO_URI=<your-mongodb-uri>
   JWT_SECRET=<your-jwt-secret>
   PORT=5000

5. Run server:
- Production: `npm start`
- Development: `npm run dev`

## API Endpoints
- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/update`, `/api/auth/delete`, `/api/auth/forgot-password`, `/api/auth/reset-password/:resettoken`, `/api/auth/update-password`
- **Stations**: `/api/stations` (POST/GET), `/api/stations/:id` (GET/PUT/DELETE)
- Swagger UI: `http://localhost:5000/api-docs`

## Dependencies
- express, mongoose, jsonwebtoken, bcryptjs, express-validator, swagger-jsdoc, swagger-ui-express, cors, helmet, morgan, dotenv

## Security
- JWT authentication
- Password hashing
- Input validation
- Secure HTTP headers

## Usage
1. Start server: `npm start`
2. Access API: `http://localhost:5000`
3. Use JWT token in `Authorization: Bearer <token>` for private endpoints

## License
ISC License
