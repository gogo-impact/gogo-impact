/**
 * Script to create an admin user in the database
 * 
 * Usage:
 *   tsx scripts/createAdminUser.ts <email> <password>
 * 
 * Example:
 *   tsx scripts/createAdminUser.ts admin@gogo.org mypassword123
 */

import { getDatabase } from '../src/config/database.js';
import bcrypt from 'bcrypt';
import { UserDocument } from '../src/services/userService.js';

async function createAdminUser(email: string, password: string) {
  try {
    const db = await getDatabase();
    const usersCollection = db.collection<UserDocument>('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      console.log(`User with email ${email} already exists.`);
      console.log('To update the password, delete the user first or modify this script.');
      process.exit(1);
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the user
    const user: UserDocument = {
      email,
      password: hashedPassword,
      autopromote: true, // This makes them an admin
      firstName: 'Admin',
      lastName: 'User',
    };

    const result = await usersCollection.insertOne(user);
    console.log(`✅ Admin user created successfully!`);
    console.log(`   Email: ${email}`);
    console.log(`   User ID: ${result.insertedId}`);
    console.log(`   Admin: ${user.autopromote}`);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: tsx scripts/createAdminUser.ts <email> <password>');
  console.error('Example: tsx scripts/createAdminUser.ts admin@gogo.org mypassword123');
  process.exit(1);
}

const [email, password] = args;
createAdminUser(email, password);

