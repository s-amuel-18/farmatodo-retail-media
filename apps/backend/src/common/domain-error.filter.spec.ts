import { ArgumentsHost, ForbiddenException } from "@nestjs/common";
import type { Response } from "express";
import {
  CampaignNotFoundError,
  ForbiddenActionError,
  InvalidTransitionError,
  ValidationError,
} from "../campaigns/domain/errors";
import { DomainErrorFilter } from "./domain-error.filter";

function makeHost(): { host: ArgumentsHost; response: Response } {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

  const host = {
    switchToHttp: () => ({ getResponse: () => response }),
  } as unknown as ArgumentsHost;

  return { host, response };
}

describe("DomainErrorFilter", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("passes through a NestJS HttpException with its own status and body", () => {
    const filter = new DomainErrorFilter();
    const { host, response } = makeHost();

    filter.catch(new ForbiddenException("nope"), host);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "nope" }),
    );
  });

  it("maps ForbiddenActionError to 403", () => {
    const filter = new DomainErrorFilter();
    const { host, response } = makeHost();

    filter.catch(new ForbiddenActionError("APPROVE", "COMMERCIAL_ANALYST"), host);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403 }),
    );
  });

  it("maps InvalidTransitionError to 409", () => {
    const filter = new DomainErrorFilter();
    const { host, response } = makeHost();

    filter.catch(new InvalidTransitionError("APPROVED", "SUBMIT"), host);

    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 409 }),
    );
  });

  it("maps ValidationError to 400", () => {
    const filter = new DomainErrorFilter();
    const { host, response } = makeHost();

    filter.catch(new ValidationError("A comment is required"), host);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400 }),
    );
  });

  it("maps CampaignNotFoundError to 404", () => {
    const filter = new DomainErrorFilter();
    const { host, response } = makeHost();

    filter.catch(new CampaignNotFoundError("campaign-1"), host);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404 }),
    );
  });

  it("falls back to a generic 500 for anything unrecognized, without leaking the raw error message", () => {
    const filter = new DomainErrorFilter();
    const { host, response } = makeHost();

    filter.catch(new Error("firestore connection reset by peer"), host);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 500,
      message: "Internal server error",
    });
  });
});
