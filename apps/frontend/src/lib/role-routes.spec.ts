import type { Role } from "@farmatodo-retail-media/types";
import { ROLE_HOME_ROUTE } from "./role-routes";

describe("ROLE_HOME_ROUTE", () => {
  it("maps COMMERCIAL_ANALYST to /campaigns", () => {
    expect(ROLE_HOME_ROUTE.COMMERCIAL_ANALYST).toBe("/campaigns");
  });

  it("maps APPROVER_MANAGER to /approvals", () => {
    expect(ROLE_HOME_ROUTE.APPROVER_MANAGER).toBe("/approvals");
  });

  it("has an entry for every Role", () => {
    const roles: Role[] = ["COMMERCIAL_ANALYST", "APPROVER_MANAGER"];
    for (const role of roles) {
      expect(ROLE_HOME_ROUTE[role]).toEqual(expect.any(String));
      expect(ROLE_HOME_ROUTE[role].length).toBeGreaterThan(0);
    }
  });

  it("only has entries for known roles", () => {
    expect(Object.keys(ROLE_HOME_ROUTE).sort()).toEqual(
      ["APPROVER_MANAGER", "COMMERCIAL_ANALYST"].sort(),
    );
  });
});
