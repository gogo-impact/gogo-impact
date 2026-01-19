# GOGO Impact Report

A full-stack web application for creating and managing customizable impact reports for Guitars Over Guns.

## 🏗️ Architecture

This is a monorepo containing both frontend and backend:

```
├── client/           # React frontend (Vite)
│   ├── src/
│   │   ├── Admin/    # Admin panel for editing content
│   │   ├── components/  # UI components
│   │   └── services/ # API client services
│   └── assets/       # Static assets (fonts, images, audio)
├── server/           # Node.js/Express backend
│   └── src/
│       ├── routes/   # API endpoints
│       ├── services/ # Business logic
│       └── config/   # Database configuration
├── api/              # Vercel serverless function (production)
├── ref/              # Reference JSON data schemas
└── public/           # Static files (favicon, etc.)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com))
- AWS S3 bucket (for file uploads)

### Local Development

1. **Install dependencies:**
   ```bash
   # Root (frontend)
   npm install
   
   # Backend
   cd server && npm install
   ```

2. **Configure environment:**
   
   Create `server/.env`:
   ```env
   MONGO_URI=mongodb://localhost:27017/gogo-impact-report
   MONGO_DB_NAME=gogo-impact-report
   PORT=4000
   SESSION_SECRET=your-secret-key-change-in-production
   
   # S3 uploads
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=us-east-1
   S3_BUCKET=your-bucket-name
   ```

3. **Start development servers:**
   ```bash
   # Terminal 1: Backend
   cd server && npm run dev
   
   # Terminal 2: Frontend
   npm run dev
   ```

4. **Access the app:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000
   - Admin Panel: http://localhost:5173/admin

## 🌐 Deployment (Vercel)

This project is configured for deployment on Vercel.

### Environment Variables

Add these in Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `MONGO_DB_NAME` | | Database name (default: `gogo-impact-report`) |
| `SESSION_SECRET` | ✅ | Random string for sessions |
| `NODE_ENV` | ✅ | Set to `production` |
| `AWS_ACCESS_KEY_ID` | For uploads | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | For uploads | AWS secret key |
| `AWS_REGION` | For uploads | e.g., `us-east-1` |
| `S3_BUCKET` | For uploads | Your S3 bucket name |

### Deploy

1. Import the repository in [Vercel](https://vercel.com)
2. Add environment variables
3. Deploy!

The app will be available at `https://your-project.vercel.app`

## 📁 Key Files

| File | Purpose |
|------|---------|
| `vercel.json` | Vercel deployment configuration |
| `api/index.ts` | Serverless function wrapping Express backend |
| `client/src/services/apiConfig.ts` | API URL configuration (dev vs prod) |
| `vite.config.ts` | Vite build configuration |

## 🔧 Scripts

### Root (Frontend)
- `npm run dev` – Start Vite dev server
- `npm run build` – Build for production
- `npm run preview` – Preview production build

### Server
- `npm run dev` – Start with hot-reload
- `npm run build` – Compile TypeScript
- `npm start` – Run compiled JavaScript

## 📊 API Endpoints

All content endpoints follow the pattern:
- `GET /api/impact/{section}` – Fetch section content
- `PUT /api/impact/{section}` – Update section content (requires auth)

Sections: `hero`, `mission`, `population`, `financial`, `method`, `curriculum`, `impact-section`, `hear-our-impact`, `testimonials`, `national-impact`, `flex-a`, `flex-b`, `flex-c`, `impact-levels`, `partners`, `footer`, `defaults`

### Other Endpoints
- `POST /api/auth/login` – Admin login
- `POST /api/auth/logout` – Admin logout
- `GET /api/auth/me` – Current user
- `POST /api/uploads/sign` – Get presigned S3 upload URL
- `GET/POST/DELETE /api/snapshots` – Version history

## 🔐 Admin Setup

See `server/ADMIN_SETUP.md` for creating admin users.

## 📚 Data Schemas

See `ref/README.md` for detailed field documentation.

---

## 📦 Repository

**Source of Truth:** [github.com/gogo-impact/gogo-impact.github.io](https://github.com/gogo-impact/gogo-impact.github.io)

This repository is maintained by Guitars Over Guns and deployed via Vercel.
