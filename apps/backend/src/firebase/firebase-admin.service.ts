import { Injectable, OnModuleInit } from "@nestjs/common";
import * as admin from "firebase-admin";

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private app!: admin.app.App;

  onModuleInit(): void {
    if (admin.apps.length > 0) {
      this.app = admin.apps[0] as admin.app.App;
      return;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

    if (!projectId || !serviceAccountBase64) {
      throw new Error(
        "Missing FIREBASE_PROJECT_ID or FIREBASE_SERVICE_ACCOUNT_BASE64 environment variables",
      );
    }

    const serviceAccount = JSON.parse(
      Buffer.from(serviceAccountBase64, "base64").toString("utf-8"),
    );

    this.app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId,
    });

    this.app.firestore().settings({ ignoreUndefinedProperties: true });
  }

  auth(): admin.auth.Auth {
    return this.app.auth();
  }

  firestore(): admin.firestore.Firestore {
    return this.app.firestore();
  }
}
