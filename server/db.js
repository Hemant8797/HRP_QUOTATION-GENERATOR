import 'dotenv/config';
import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is required. Copy .env.example to .env and add your MongoDB connection string.');
}

export async function connectDatabase() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected to MongoDB database "${mongoose.connection.name}"`);
}
