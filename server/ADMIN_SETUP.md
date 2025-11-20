# Admin Login Setup

This guide explains how to set up the admin login system and create an admin user.

## Overview

The admin system uses:
- **Session-based authentication** (no email verification needed)
- **MongoDB** to store user credentials
- **bcrypt** for password hashing
- **Protected routes** for all admin operations (PUT/POST)

## Creating an Admin User

### Option 1: Using the Script (Recommended)

1. Make sure your server is configured with the correct MongoDB connection string in `.env`:
   ```
   MONGO_URI=your_mongodb_connection_string
   MONGO_DB_NAME=gogo-impact-report
   ```

2. Run the create admin user script:
   ```bash
   cd server
   npx tsx scripts/createAdminUser.ts <email> <password>
   ```

   Example:
   ```bash
   npx tsx scripts/createAdminUser.ts admin@gogo.org mySecurePassword123
   ```

3. The script will:
   - Hash the password using bcrypt
   - Create a user in the `users` collection
   - Set `autopromote: true` to make them an admin

### Option 2: Manual MongoDB Insert

If you prefer to create the user directly in MongoDB:

1. Connect to your MongoDB database
2. Use the MongoDB shell or a GUI tool (like MongoDB Compass)
3. Insert a document into the `users` collection:

```javascript
// First, hash your password using Node.js:
// In a Node.js REPL or script:
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash('your-password-here', 10);
console.log(hashedPassword); // Copy this value

// Then insert into MongoDB:
db.users.insertOne({
  email: "admin@gogo.org",
  password: "<paste-hashed-password-here>",
  autopromote: true,
  firstName: "Admin",
  lastName: "User"
});
```

## Environment Variables

Make sure these are set in your `.env` file:

```env
MONGO_URI=mongodb://localhost:27017/your-database
MONGO_DB_NAME=gogo-impact-report
SESSION_SECRET=your-random-secret-key-here
```

**Important**: Change `SESSION_SECRET` to a random string in production!

## Testing the Login

1. Start your server:
   ```bash
   cd server
   npm run dev
   ```

2. Navigate to `http://localhost:5173/admin/login` (or your frontend URL)

3. Enter the email and password you created

4. You should be redirected to `/admin` after successful login

## How It Works

- **GET routes** (`/api/impact/hero`, `/api/impact/mission`, etc.) are **public** - anyone can view the content
- **PUT/POST routes** are **protected** - require admin authentication
- Sessions are stored in MongoDB using `connect-mongo`
- Sessions expire after 7 days of inactivity

## Troubleshooting

### "Cannot connect to backend server"
- Make sure the server is running on port 4000 (or your configured port)
- Check that `VITE_BACKEND_URL` in your client `.env` matches your server URL

### "Authentication required" error
- Make sure you're logged in
- Check that your session hasn't expired
- Try logging out and logging back in

### User creation fails
- Verify MongoDB connection string is correct
- Check that the `users` collection exists (it will be created automatically)
- Ensure bcrypt is installed: `npm install bcrypt`

