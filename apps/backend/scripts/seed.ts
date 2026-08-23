import * as admin from "firebase-admin";
import type { Brand, MediaCost, Product, Supplier } from "@farmatodo-retail-media/types";
import { initAdmin } from "./lib/init-admin";

const suppliers: Supplier[] = [
  { id: "supplier-1", name: "Laboratorios Genfar" },
  { id: "supplier-2", name: "Consumer Health SA" },
];

const brands: Brand[] = [
  { id: "brand-1", name: "VitaPlus" },
  { id: "brand-2", name: "DermaCare" },
];

const products: Product[] = [
  { sku: "sku-1", name: "VitaPlus C 1000mg x30", brandId: "brand-1" },
  { sku: "sku-2", name: "DermaCare Hidratante 200ml", brandId: "brand-2" },
];

const mediaCosts: MediaCost[] = [
  { id: "mc-supplier-1-petalo", supplierId: "supplier-1", channel: "PETALO", unitCostUsd: 150 },
  { id: "mc-supplier-1-parrillera", supplierId: "supplier-1", channel: "PARRILLERA", unitCostUsd: 90 },
  { id: "mc-supplier-1-sms", supplierId: "supplier-1", channel: "SMS", unitCostUsd: 300 },
  { id: "mc-supplier-1-tiktok", supplierId: "supplier-1", channel: "TIKTOK", unitCostUsd: 250 },
  { id: "mc-supplier-2-petalo", supplierId: "supplier-2", channel: "PETALO", unitCostUsd: 180 },
  { id: "mc-supplier-2-sms", supplierId: "supplier-2", channel: "SMS", unitCostUsd: 320 },
];

async function seedByField<T>(
  collection: string,
  items: T[],
  idOf: (item: T) => string,
): Promise<void> {
  const db = admin.firestore();
  const batch = db.batch();
  for (const item of items) {
    batch.set(db.collection(collection).doc(idOf(item)), item as unknown as FirebaseFirestore.DocumentData);
  }
  await batch.commit();
  console.log(`Seeded ${items.length} docs into '${collection}'`);
}

async function main() {
  initAdmin();
  await seedByField("suppliers", suppliers, (s) => s.id);
  await seedByField("brands", brands, (b) => b.id);
  await seedByField("products", products, (p) => p.sku);
  await seedByField("mediaCosts", mediaCosts, (m) => m.id);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
