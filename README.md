# TME Backend

Node.js backend API for TME application with Prisma ORM and PostgreSQL.

## Features

- User authentication (register/login)
- Student and teacher management
- Assignment system
- Prisma Accelerate for production deployment

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login

### Assignments
- `POST /api/v1/assignments` - Create assignment
- `GET /api/v1/assignables` - Get assignable students/classes

## Deployment

This application is configured for deployment on Railway with Prisma Accelerate.

### Environment Variables

Set these in your deployment platform:

```
DATABASE_URL=prisma://accelerate.prisma-data.net/?api_key=YOUR_ACCELERATE_API_KEY
JWT_SECRET=your_jwt_secret_here
```

### Getting Prisma Accelerate API Key

1. Go to [Prisma Accelerate Dashboard](https://accelerate.prisma-data.net)
2. Connect your database
3. Copy the connection string and use it as `DATABASE_URL`

## Local Development

```bash
npm install
npm run prisma:generate
npm run dev
```

## Database Migrations

```bash
npm run prisma:migrate
```
