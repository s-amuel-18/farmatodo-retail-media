import { Injectable } from "@nestjs/common";
import type * as admin from "firebase-admin";
import type {
  Campaign,
  CampaignListFilters,
  HistoryEntry,
  NewCampaignInput,
  Paginated,
} from "@farmatodo-retail-media/types";
import { CampaignNotFoundError } from "../../domain/errors";
import type { CampaignDraft, CampaignRepository, Decide } from "../../application/ports/campaign-repository.port";
import { FirebaseAdminService } from "../../../firebase/firebase-admin.service";

const COLLECTION = "campaigns";
const DEFAULT_PAGE_SIZE = 20;

@Injectable()
export class FirestoreCampaignRepository implements CampaignRepository {
  constructor(private readonly firebaseAdmin: FirebaseAdminService) {}

  private collection() {
    return this.firebaseAdmin.firestore().collection(COLLECTION);
  }

  async findById(id: string): Promise<Campaign | null> {
    const snap = await this.collection().doc(id).get();
    if (!snap.exists) return null;
    return docToCampaign(snap.id, snap.data() as admin.firestore.DocumentData);
  }

  async create(draft: CampaignDraft): Promise<Campaign> {
    const ref = this.collection().doc();
    const campaign = {
      ...draft,
      id: ref.id,
      status: "DRAFT",
      createdAt: new Date().toISOString(),
    } as Campaign;

    await ref.set(campaignToDoc(campaign));
    return campaign;
  }

  async replaceEditableFields(
    id: string,
    input: NewCampaignInput,
    totalCostUsd: number,
  ): Promise<Campaign> {
    const ref = this.collection().doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw new CampaignNotFoundError(id);

    const current = docToCampaign(snap.id, snap.data() as admin.firestore.DocumentData);
    const updated = { ...current, ...input, totalCostUsd } as Campaign;

    await ref.set(campaignToDoc(updated));
    return updated;
  }

  async transactionalUpdate(id: string, decide: Decide): Promise<Campaign> {
    const ref = this.collection().doc(id);

    return this.firebaseAdmin.firestore().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new CampaignNotFoundError(id);

      const current = docToCampaign(snap.id, snap.data() as admin.firestore.DocumentData);
      const { campaign, historyEntry } = decide(current);

      tx.set(ref, campaignToDoc(campaign));
      const historyRef = ref.collection("history").doc();
      tx.set(historyRef, { ...historyEntry, id: historyRef.id });

      return campaign;
    });
  }

  async list(filters: CampaignListFilters): Promise<Paginated<Campaign>> {
    const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
    let query: admin.firestore.Query = this.collection();

    if (filters.createdBy) query = query.where("createdBy", "==", filters.createdBy);
    if (filters.status?.length) query = query.where("status", "in", filters.status);
    if (filters.dateFrom) query = query.where("createdAt", ">=", filters.dateFrom);
    if (filters.dateTo) query = query.where("createdAt", "<=", filters.dateTo);

    query = query.orderBy("createdAt", "asc").limit(pageSize);

    if (filters.cursor) {
      const cursorSnap = await this.collection().doc(filters.cursor).get();
      if (cursorSnap.exists) query = query.startAfter(cursorSnap);
    }

    const snap = await query.get();
    const items = snap.docs.map((doc) =>
      docToCampaign(doc.id, doc.data() as admin.firestore.DocumentData),
    );
    const nextCursor = items.length === pageSize ? items[items.length - 1]?.id ?? null : null;

    return { items, nextCursor };
  }

  async listHistory(campaignId: string): Promise<HistoryEntry[]> {
    const snap = await this.collection()
      .doc(campaignId)
      .collection("history")
      .orderBy("occurredAt", "asc")
      .get();

    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as HistoryEntry);
  }
}

function docToCampaign(id: string, data: admin.firestore.DocumentData): Campaign {
  return { id, ...data } as Campaign;
}

function campaignToDoc(campaign: Campaign): admin.firestore.DocumentData {
  const { id, ...rest } = campaign;
  return rest;
}
