import { registerAs } from '@nestjs/config';

export const firebaseConfig = registerAs('firebase', () => ({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  dataBaseUrl: process.env.FIREBASE_CLIENT_DATABASE_URL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
}));
