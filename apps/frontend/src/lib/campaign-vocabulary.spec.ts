import { CAMPAIGN_STATUSES } from "@farmatodo-retail-media/types";
import type { ChannelType, PetaloZone, Role } from "@farmatodo-retail-media/types";
import {
  CAMPAIGN_STATUS_LABELS,
  CHANNEL_LABELS,
  CHANNEL_TYPES,
  EDITABLE_CAMPAIGN_STATUSES,
  HISTORY_ACTION_LABELS,
  PETALO_ZONES,
  PETALO_ZONE_LABELS,
  ROLE_LABELS,
} from "./campaign-vocabulary";

describe("campaign-vocabulary", () => {
  it("has a label for every campaign status", () => {
    for (const status of CAMPAIGN_STATUSES) {
      expect(CAMPAIGN_STATUS_LABELS[status]).toEqual(expect.any(String));
      expect(CAMPAIGN_STATUS_LABELS[status].length).toBeGreaterThan(0);
    }
  });

  it("marks DRAFT and REJECTED as editable, and the rest as not", () => {
    expect(EDITABLE_CAMPAIGN_STATUSES.has("DRAFT")).toBe(true);
    expect(EDITABLE_CAMPAIGN_STATUSES.has("REJECTED")).toBe(true);
    expect(EDITABLE_CAMPAIGN_STATUSES.has("PENDING_APPROVAL")).toBe(false);
    expect(EDITABLE_CAMPAIGN_STATUSES.has("APPROVED")).toBe(false);
  });

  it("has a label for every channel type", () => {
    const channels: ChannelType[] = ["PETALO", "PARRILLERA", "SMS", "TIKTOK"];
    expect(CHANNEL_TYPES).toEqual(channels);
    for (const channel of channels) {
      expect(CHANNEL_LABELS[channel]).toEqual(expect.any(String));
    }
  });

  it("has a label for every petalo zone", () => {
    const zones: PetaloZone[] = ["ENTRADA", "PASILLO_CENTRAL", "CAJAS"];
    expect(PETALO_ZONES).toEqual(zones);
    for (const zone of zones) {
      expect(PETALO_ZONE_LABELS[zone]).toEqual(expect.any(String));
    }
  });

  it("has a label for every role", () => {
    const roles: Role[] = ["COMMERCIAL_ANALYST", "APPROVER_MANAGER"];
    for (const role of roles) {
      expect(ROLE_LABELS[role]).toEqual(expect.any(String));
    }
  });

  it("has a label for every history action", () => {
    expect(HISTORY_ACTION_LABELS.SUBMITTED).toBe("Enviada a aprobación");
    expect(HISTORY_ACTION_LABELS.APPROVED).toBe("Aprobada");
    expect(HISTORY_ACTION_LABELS.REJECTED).toBe("Rechazada");
  });
});
