import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import { FirebaseAuthGuard } from "./firebase-auth.guard";
import type { FirebaseAdminService } from "../firebase/firebase-admin.service";
import type { RequestUser } from "./request-user";

function makeContext(request: Partial<Request>): {
  context: ExecutionContext;
  requestRef: Partial<Request> & { user?: RequestUser };
} {
  const requestRef: Partial<Request> & { user?: RequestUser } = { ...request };
  const context = {
    switchToHttp: () => ({ getRequest: () => requestRef }),
  } as unknown as ExecutionContext;
  return { context, requestRef };
}

function makeGuard(verifyIdToken: jest.Mock) {
  const firebaseAdmin = { auth: () => ({ verifyIdToken }) } as unknown as FirebaseAdminService;
  return new FirebaseAuthGuard(firebaseAdmin);
}

describe("FirebaseAuthGuard", () => {
  it("rejects a request with no Authorization header", async () => {
    const guard = makeGuard(jest.fn());
    const { context } = makeContext({ headers: {} });
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("rejects an Authorization header that isn't a Bearer token", async () => {
    const guard = makeGuard(jest.fn());
    const { context } = makeContext({ headers: { authorization: "Basic dXNlcjpwYXNz" } });
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("rejects a Bearer header with no token after it", async () => {
    const guard = makeGuard(jest.fn());
    const { context } = makeContext({ headers: { authorization: "Bearer    " } });
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("rejects when firebase-admin fails to verify the token (invalid or expired)", async () => {
    const verifyIdToken = jest.fn().mockRejectedValue(new Error("Firebase ID token has expired"));
    const guard = makeGuard(verifyIdToken);
    const { context } = makeContext({ headers: { authorization: "Bearer expired-token" } });
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("attaches uid, email and role to the request and allows the call through on a valid token", async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({
      uid: "user-1",
      email: "analyst@farmatodo.com",
      role: "COMMERCIAL_ANALYST",
    });
    const guard = makeGuard(verifyIdToken);
    const { context, requestRef } = makeContext({
      headers: { authorization: "Bearer valid-token" },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(verifyIdToken).toHaveBeenCalledWith("valid-token");
    expect(requestRef.user).toEqual({
      uid: "user-1",
      email: "analyst@farmatodo.com",
      role: "COMMERCIAL_ANALYST",
    });
  });

  it("leaves role undefined for a valid token with no role custom claim yet, instead of rejecting here", async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: "user-2", email: "new@farmatodo.com" });
    const guard = makeGuard(verifyIdToken);
    const { context, requestRef } = makeContext({
      headers: { authorization: "Bearer no-role-yet" },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(requestRef.user?.role).toBeUndefined();
  });

  it("defaults email to an empty string when the token carries none", async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({ uid: "user-3", role: "APPROVER_MANAGER" });
    const guard = makeGuard(verifyIdToken);
    const { context, requestRef } = makeContext({
      headers: { authorization: "Bearer valid-token" },
    });

    await guard.canActivate(context);
    expect(requestRef.user?.email).toBe("");
  });
});
