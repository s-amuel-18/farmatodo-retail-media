import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Role } from "@farmatodo-retail-media/types";
import { RolesGuard } from "./roles.guard";
import type { RequestUser } from "./request-user";

function makeContext(user?: RequestUser): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

function makeGuard(requiredRoles: Role[] | undefined) {
  const reflector = { getAllAndOverride: jest.fn().mockReturnValue(requiredRoles) } as unknown as Reflector;
  return new RolesGuard(reflector);
}

describe("RolesGuard", () => {
  it("denies a request with no authenticated user on it, even for an unrestricted route", () => {
    const guard = makeGuard(undefined);
    expect(() => guard.canActivate(makeContext(undefined))).toThrow(ForbiddenException);
  });

  it("allows any authenticated user through when the route declares no @Roles()", () => {
    const guard = makeGuard(undefined);
    const user: RequestUser = { uid: "u1", email: "a@x.com", role: "COMMERCIAL_ANALYST" };
    expect(guard.canActivate(makeContext(user))).toBe(true);
  });

  it("allows any authenticated user through when @Roles() is an empty list", () => {
    const guard = makeGuard([]);
    const user: RequestUser = { uid: "u1", email: "a@x.com", role: "COMMERCIAL_ANALYST" };
    expect(guard.canActivate(makeContext(user))).toBe(true);
  });

  it("allows a user whose role is in the required list", () => {
    const guard = makeGuard(["APPROVER_MANAGER"]);
    const user: RequestUser = { uid: "u1", email: "m@x.com", role: "APPROVER_MANAGER" };
    expect(guard.canActivate(makeContext(user))).toBe(true);
  });

  it("denies a user whose role is not in the required list — this is what blocks a crafted request calling the API with the wrong role", () => {
    const guard = makeGuard(["APPROVER_MANAGER"]);
    const user: RequestUser = { uid: "u1", email: "a@x.com", role: "COMMERCIAL_ANALYST" };
    expect(() => guard.canActivate(makeContext(user))).toThrow(ForbiddenException);
  });

  it("denies a user with no role claim at all, even on a restricted route", () => {
    const guard = makeGuard(["COMMERCIAL_ANALYST"]);
    const user: RequestUser = { uid: "u1", email: "a@x.com", role: undefined };
    expect(() => guard.canActivate(makeContext(user))).toThrow(ForbiddenException);
  });
});
