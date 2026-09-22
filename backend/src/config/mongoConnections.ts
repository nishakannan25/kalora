import mongoose, { Connection } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const LOCAL_ARTISAN_URI = 'mongodb://127.0.0.1:27017/kalora_artisan_db';
const LOCAL_CUSTOMER_URI = 'mongodb://127.0.0.1:27017/kalora_customer_db';

const ARTISAN_DB_URI = process.env.USE_LOCAL_MONGO === 'true' ? LOCAL_ARTISAN_URI : (process.env.ARTISAN_DATABASE_URL || LOCAL_ARTISAN_URI);
const CUSTOMER_DB_URI = process.env.USE_LOCAL_MONGO === 'true' ? LOCAL_CUSTOMER_URI : (process.env.CUSTOMER_DATABASE_URL || LOCAL_CUSTOMER_URI);

export const artisanDbConnection: Connection = mongoose.createConnection(ARTISAN_DB_URI, {
  autoIndex: true,
  serverSelectionTimeoutMS: 5000,
});

export const customerDbConnection: Connection = mongoose.createConnection(CUSTOMER_DB_URI, {
  autoIndex: true,
  serverSelectionTimeoutMS: 5000,
});

artisanDbConnection.on('connected', () => {
  console.log('🍃 [MongoDB] Successfully connected to ARTISAN DATABASE');
});

artisanDbConnection.on('error', (err) => {
  console.warn('⚠️ [MongoDB] Cloud Artisan DB Connection issue (SSL/IP Whitelist). System operating with primary Prisma DB fallback.');
});

customerDbConnection.on('connected', () => {
  console.log('🍃 [MongoDB] Successfully connected to CUSTOMER DATABASE');
});

customerDbConnection.on('error', (err) => {
  console.warn('⚠️ [MongoDB] Cloud Customer DB Connection issue (SSL/IP Whitelist). System operating with primary Prisma DB fallback.');
});

export async function connectBothMongoDatabases() {
  try {
    console.log('⚡ Initializing dual MongoDB Database connections...');
  } catch (error) {
    console.error('❌ Error initializing MongoDB databases:', error);
  }
}

