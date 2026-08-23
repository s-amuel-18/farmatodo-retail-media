import { Injectable } from "@nestjs/common";
import type { MediaCost } from "@farmatodo-retail-media/types";
import type { MediaCostRepository } from "../../application/ports/media-cost-repository.port";
import { FirebaseAdminService } from "../../../firebase/firebase-admin.service";

const COLLECTION = "mediaCosts";

@Injectable()
export class FirestoreMediaCostRepository implements MediaCostRepository {
  constructor(private readonly firebaseAdmin: FirebaseAdminService) {}

  async listAll(): Promise<MediaCost[]> {
    const snap = await this.firebaseAdmin.firestore().collection(COLLECTION).get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as MediaCost);
  }
}
