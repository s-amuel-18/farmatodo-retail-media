import * as admin from "firebase-admin";
import { FIRESTORE_COLLECTIONS } from "@farmatodo-retail-media/types";
import { initAdmin } from "./lib/init-admin";

/**
 * Deletes every non-seed document, i.e. everything created through app usage
 * (campaigns and their history subcollection). Seed catalogs (suppliers,
 * brands, products, mediaCosts) are left untouched — re-run `pnpm seed` if
 * you also want those reset to their known baseline.
 */
const USER_GENERATED_COLLECTIONS = [FIRESTORE_COLLECTIONS.campaigns];

async function main() {
  const args = process.argv.slice(2);
  const yes = args.includes("--yes") || args.includes("-y");
  const dryRun = args.includes("--dry-run");

  const app = initAdmin();
  const db = app.firestore();
  const projectId = app.options.projectId;

  if (!yes && !dryRun) {
    console.error(
      `Refusing to run: this permanently deletes all documents in [${USER_GENERATED_COLLECTIONS.join(", ")}] ` +
        `(and their subcollections) in Firebase project "${projectId}".\n` +
        `Re-run with --yes to confirm, or --dry-run to only see counts.`,
    );
    process.exit(1);
  }

  console.log(`Target project: ${projectId}`);

  for (const collectionName of USER_GENERATED_COLLECTIONS) {
    const snapshot = await db.collection(collectionName).listDocuments();
    console.log(`${collectionName}: ${snapshot.length} doc(s) found`);

    if (dryRun) continue;

    for (const docRef of snapshot) {
      await db.recursiveDelete(docRef);
    }
    console.log(`${collectionName}: deleted (including subcollections)`);
  }

  if (dryRun) {
    console.log("Dry run only — nothing was deleted.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
