import { FIRESTORE_COLLECTIONS } from "@farmatodo-retail-media/types";
import { initAdmin } from "./lib/init-admin";
import { seedAll } from "./seed";

/**
 * Full reset: deletes every document in every Firestore collection (catalogs
 * and campaigns, including the campaigns/{id}/history subcollection), then
 * re-runs the catalog seed. Firebase Auth users are untouched — this script
 * never calls the Auth API, only Firestore.
 */
const ALL_COLLECTIONS = Object.values(FIRESTORE_COLLECTIONS);

async function main() {
  const args = process.argv.slice(2);
  const yes = args.includes("--yes") || args.includes("-y");
  const dryRun = args.includes("--dry-run");

  const app = initAdmin();
  const db = app.firestore();
  const projectId = app.options.projectId;

  if (!yes && !dryRun) {
    console.error(
      `Refusing to run: this permanently deletes all documents in [${ALL_COLLECTIONS.join(", ")}] ` +
        `(and their subcollections) in Firebase project "${projectId}", then re-seeds the catalogs.\n` +
        `Firebase Auth users are not touched.\n` +
        `Re-run with --yes to confirm, or --dry-run to only see counts.`,
    );
    process.exit(1);
  }

  console.log(`Target project: ${projectId}`);

  for (const collectionName of ALL_COLLECTIONS) {
    const snapshot = await db.collection(collectionName).listDocuments();
    console.log(`${collectionName}: ${snapshot.length} doc(s) found`);

    if (dryRun) continue;

    for (const docRef of snapshot) {
      await db.recursiveDelete(docRef);
    }
    console.log(`${collectionName}: deleted (including subcollections)`);
  }

  if (dryRun) {
    console.log("Dry run only — nothing was deleted or re-seeded.");
    return;
  }

  console.log("Re-seeding catalogs...");
  await seedAll();
  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
