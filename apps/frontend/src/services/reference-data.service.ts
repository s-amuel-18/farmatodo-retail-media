import { collection, getDocs } from "firebase/firestore";
import { FIRESTORE_COLLECTIONS } from "@farmatodo-retail-media/types";
import type { Brand, MediaCost, Product, Supplier } from "@farmatodo-retail-media/types";
import { firestoreClient } from "../lib/firebase-client";

export const referenceDataService = {
  async listBrands(): Promise<Brand[]> {
    const snap = await getDocs(collection(firestoreClient, FIRESTORE_COLLECTIONS.brands));
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Brand);
  },

  async listProducts(): Promise<Product[]> {
    const snap = await getDocs(collection(firestoreClient, FIRESTORE_COLLECTIONS.products));
    return snap.docs.map((doc) => ({ sku: doc.id, ...doc.data() }) as Product);
  },

  async listSuppliers(): Promise<Supplier[]> {
    const snap = await getDocs(collection(firestoreClient, FIRESTORE_COLLECTIONS.suppliers));
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Supplier);
  },

  async listMediaCosts(): Promise<MediaCost[]> {
    const snap = await getDocs(collection(firestoreClient, FIRESTORE_COLLECTIONS.mediaCosts));
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as MediaCost);
  },
};
