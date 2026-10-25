import * as admin from "firebase-admin";

function formatPrivateKey(key?: string): string | undefined {
  if (!key) return undefined;
  return key.replace(/\\n/g, "\n");
}

export function getFirebaseAdmin(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = formatPrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) {
    // Only warn if in production, in dev allow graceful degradation
    if (process.env.NODE_ENV === "production") {
      console.warn("Firebase Admin credentials missing in environment variables.");
    }
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: projectId || "dummy-project-id",
      clientEmail: clientEmail || "dummy@dummy.iam.gserviceaccount.com",
      privateKey: privateKey || "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC6...\n-----END PRIVATE KEY-----",
    }),
  });
}
