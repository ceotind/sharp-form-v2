import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';

// Initialize Firebase Admin with conditional check for server-side only
let adminDb: ReturnType<typeof getFirestore>;

// Only initialize on the server side
if (typeof window === 'undefined') {
  try {
    const apps = getApps();
    
    if (!apps.length) {
      // Check if we're in a production environment (Vercel)
      if (process.env.VERCEL) {
        // Use environment variables for production
        initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // Handle escaped newlines in the private key
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        });
      } else {
        // Local development - can use a different approach if needed
        initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        });
      }
    }
    
    adminDb = getFirestore();
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    // Provide a fallback for error cases
    adminDb = {} as ReturnType<typeof getFirestore>;
  }
} else {
  // Client-side fallback (won't be used, but prevents build errors)
  adminDb = {} as ReturnType<typeof getFirestore>;
}

export { adminDb, NextResponse };