import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { DB_NAME } from '../constants.js';

dotenv.config();

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONOGDB_URI;

    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in the .env file');
    }

    const connection = await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`);

    console.log(`✅ Connected to MongoDB at ${connection.connection.host}/${DB_NAME}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
    // process.exit(1); // Exit with failure
  }
};

export default connectDB;
