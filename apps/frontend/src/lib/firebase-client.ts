import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FB_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID as string,
  appId: process.env.NEXT_PUBLIC_FB_APP_ID as string,
};

export const firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
// Read-only reference catalogs (brands/products/suppliers/mediaCosts) are
// fetched straight from Firestore — firestore.rules already gate them to
// signed-in users, and they carry no business logic worth a backend round
// trip through NestJS.
export const firestoreClient = getFirestore(firebaseApp);
