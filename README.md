# ERP Base Backend

This is the backend server for the ERP Base template, built with Node.js, Express, Socket.IO, and Prisma ORM.

## Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL Database

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   The `.env` and `.env.development` files are included in the repository. These contain the database connection URLs and necessary secrets. You do not need to configure them manually for a quick start, but make sure to update them for production.

3. **Database Setup (Prisma)**
   The project uses Prisma for ORM. Since `.env.development` is being used, we have predefined commands to load the environment automatically:

   Generate the Prisma Client:
   ```bash
   npm run prisma:generate
   ```

   Apply migrations to your database:
   ```bash
   npm run prisma:migrate
   ```

   Seed the database with initial roles, permissions, and the Super Admin user:
   ```bash
   npm run prisma:seed
   ```
   *(Note: The default Super Admin will be created with username `superadmin` and employee ID `EMP0001`)*

## Running the Server

Start the development server (runs with nodemon and automatically generates Swagger docs):
```bash
npm run dev
```

The server will typically start on port `5000` (or whatever is defined in your `.env.development` file).

## API Documentation
Once the server is running, you can view the auto-generated Swagger API documentation at:
`https://localhost:5000/api-docs` (Note: adjust port/protocol based on your env settings, currently configured for HTTPS locally).

## Features
- Complete Authentication Flow (JWT)
- Role-based Access Control & Permissions
- Real-time Socket.IO Active User Tracking
- Dynamic Lookup Management System
