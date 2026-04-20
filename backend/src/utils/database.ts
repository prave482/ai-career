import mongoose from 'mongoose';

let attemptedConnection = false;
let lastDatabaseStatus = 'disconnected';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri || attemptedConnection) return;

  attemptedConnection = true;

  try {
    await mongoose.connect(uri);
    lastDatabaseStatus = 'connected';
    console.log('MongoDB connected');
  } catch (error) {
    lastDatabaseStatus = 'memory-fallback';
    console.error('MongoDB unavailable, continuing with in-memory storage.', error);
  }
}

export function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

export function getDatabaseStatus() {
  if (isDatabaseReady()) return 'connected';
  return lastDatabaseStatus;
}
