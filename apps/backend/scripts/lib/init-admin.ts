import * as dotenv from "dotenv";
dotenv.config();
import * as admin from "firebase-admin";

export function initAdmin(): admin.app.App {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (!projectId || !serviceAccountBase64) {
    throw new Error(
      "Missing FIREBASE_PROJECT_ID or FIREBASE_SERVICE_ACCOUNT_BASE64 - copy apps/backend/.env.example to .env and fill it in",
    );
  }

  const serviceAccount = JSON.parse(
    Buffer.from(serviceAccountBase64, "base64").toString("utf-8"),
  );

  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId,
  });
  app.firestore().settings({ ignoreUndefinedProperties: true });
  return app;
}
