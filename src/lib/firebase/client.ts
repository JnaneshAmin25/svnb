"use client";

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { clientEnv } from "@/lib/firebase/client-env";

// Re-export the browser-only Firebase auth types/components so consumers can
// import them from a single module without crossing the client/server boundary.
export type { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";

/**
 * Client-side Firebase SDK.
 *
 * Lazily initializes a single Firebase app and exposes an `Auth` instance.
 * Public config values are read from NEXT_PUBLIC_FIREBASE_* env vars (set at
 * build time by Next.js). When any value is missing, helpers throw so callers
 * can hide the Firebase login UI gracefully.
 */

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;

export function isFirebaseClientConfigured() {
  return Boolean(
    clientEnv.NEXT_PUBLIC_FIREBASE_API_KEY &&
      clientEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      clientEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      clientEnv.NEXT_PUBLIC_FIREBASE_APP_ID,
  );
}

export function getFirebaseApp(): FirebaseApp {
  if (cachedApp) return cachedApp;
  if (!isFirebaseClientConfigured()) {
    throw new Error(
      "Firebase client is not configured. Set NEXT_PUBLIC_FIREBASE_* keys in .env.local.",
    );
  }
  const app = getApps()[0] ?? initializeApp({
    apiKey: clientEnv.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: clientEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: clientEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: clientEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: clientEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: clientEnv.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
  cachedApp = app;
  return app;
}

export function getFirebaseAuthClient(): Auth {
  if (cachedAuth) return cachedAuth;
  cachedAuth = getAuth(getFirebaseApp());
  return cachedAuth;
}
