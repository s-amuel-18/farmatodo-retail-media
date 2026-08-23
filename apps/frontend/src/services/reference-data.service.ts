import { collection, getDocs } from "firebase/firestore";
import type { Brand, MediaCost, Product, Supplier } from "@farmatodo-retail-media/types";
import { firestoreClient } from "../lib/firebase-client";

export const referenceDataService = {
  async listBrands(): Promise<Brand[]> {
    const snap = await getDocs(collection(firestoreClient, "brands"));
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Brand);
  },

  async listProducts(): Promise<Product[]> {
    const snap = await getDocs(collection(firestoreClient, "products"));
    return snap.docs.map((doc) => ({ sku: doc.id, ...doc.data() }) as Product);
  },

  async listSuppliers(): Promise<Supplier[]> {
    const snap = await getDocs(collection(firestoreClient, "suppliers"));
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Supplier);
  },

  async listMediaCosts(): Promise<MediaCost[]> {
    const snap = await getDocs(collection(firestoreClient, "mediaCosts"));
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as MediaCost);
  },
};
