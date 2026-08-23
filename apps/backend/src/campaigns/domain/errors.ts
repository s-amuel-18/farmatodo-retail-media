import type { CampaignStatus, Role } from "@farmatodo-retail-media/types";

export class InvalidTransitionError extends Error {
  constructor(
    public readonly from: CampaignStatus,
    public readonly action: string,
  ) {
    super(`Cannot apply action '${action}' to a campaign in status '${from}'`);
    this.name = "InvalidTransitionError";
  }
}

export class ForbiddenActionError extends Error {
  constructor(
    public readonly action: string,
    public readonly actorRole: Role,
  ) {
    super(`Role '${actorRole}' is not allowed to perform action '${action}'`);
    this.name = "ForbiddenActionError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class CampaignNotFoundError extends Error {
  constructor(public readonly campaignId: string) {
    super(`Campaign '${campaignId}' not found`);
    this.name = "CampaignNotFoundError";
  }
}

export type DomainError =
  | InvalidTransitionError
  | ForbiddenActionError
  | ValidationError
  | CampaignNotFoundError;
