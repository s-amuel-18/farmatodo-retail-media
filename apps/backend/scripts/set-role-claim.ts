import * as admin from "firebase-admin";
import type { Role } from "@farmatodo-retail-media/types";
import { initAdmin } from "./lib/init-admin";

function parseArgs(): { email: string; role: Role } {
  const [, , email, role] = process.argv;
  if (!email || (role !== "COMMERCIAL_ANALYST" && role !== "APPROVER_MANAGER")) {
    console.error(
      "Usage: pnpm set-claim <email> <COMMERCIAL_ANALYST|APPROVER_MANAGER>",
    );
    process.exit(1);
  }
  return { email, role };
}

async function main() {
  initAdmin();
  const { email, role } = parseArgs();

  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { role });

  console.log(`Assigned role '${role}' to ${email} (uid=${user.uid})`);
  console.log("The user must sign out and sign back in for the new claim to reach the ID token.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
