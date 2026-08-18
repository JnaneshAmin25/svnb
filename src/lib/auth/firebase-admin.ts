import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { env } from "@/lib/env";

/**
 * Server-side Firebase Admin SDK.
 *
 * Used by the API route that exchanges a Firebase ID token (issued by the
 * client-side Phone Auth flow) for a session cookie on our backend.
 *
 * Initialization is lazy + idempotent so it is safe to import from anywhere
 * on the server. When the required env vars are missing the helpers throw a
 * descriptive error so callers fail fast instead of silently succeeding.
 */

let adminApp: App | null = null;
let adminAuth: Auth | null = null;

export function isFirebaseAdminConfigured() {
  return Boolean(
    env.FIREBASE_ADMIN_PROJECT_ID &&
      env.FIREBASE_ADMIN_CLIENT_EMAIL &&
      env.FIREBASE_ADMIN_PRIVATE_KEY,
  );
}

function getAdminApp(): App {
  if (adminApp) return adminApp;
  if (!isFirebaseAdminConfigured()) {
    throw new Error(
      "Firebase Admin SDK is not configured. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in .env.local.",
    );
  }

  // Reuse an existing app if Next.js hot-reload re-evaluates this module.
  const existing = getApps()[0];
  if (existing) {
    adminApp = existing;
    return adminApp;
  }

  // The private key in .env.local is stored with literal "\n" sequences. They
  // must be converted to real newlines so Node's crypto layer accepts them.
  const privateKey = (env.FIREBASE_ADMIN_PRIVATE_KEY as string).replace(
    /\\n/g,
    "\n",
  );

  adminApp = initializeApp({
    credential: cert({
      projectId: env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
  return adminApp;
}

export function getFirebaseAuth(): Auth {
  if (adminAuth) return adminAuth;
  adminAuth = getAuth(getAdminApp());
  return adminAuth;
}

/**
 * Verify a Firebase ID token from the client. Returns the decoded claims
 * (uid, phone_number, etc.) on success or null on failure.
 */
export async function verifyFirebaseIdToken(idToken: string) {
  try {
    const decoded = await getFirebaseAuth().verifyIdToken(idToken);
    return decoded;
  } catch (err) {
    console.error("[firebase-admin] verifyIdToken failed", err);
    return null;
  }
}
