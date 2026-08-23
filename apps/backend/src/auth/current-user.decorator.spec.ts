import { ExecutionContext, InternalServerErrorException } from "@nestjs/common";
import { extractCurrentUser } from "./current-user.decorator";
import type { RequestUser } from "./request-user";

function makeContext(user?: RequestUser): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe("extractCurrentUser", () => {
  it("returns uid, email and role from the request when RolesGuard has already run", () => {
    const user: RequestUser = { uid: "u1", email: "a@x.com", role: "COMMERCIAL_ANALYST" };
    expect(extractCurrentUser(makeContext(user))).toEqual({
      uid: "u1",
      email: "a@x.com",
      role: "COMMERCIAL_ANALYST",
    });
  });

  it("throws InternalServerErrorException when there is no user on the request at all", () => {
    expect(() => extractCurrentUser(makeContext(undefined))).toThrow(
      InternalServerErrorException,
    );
  });

  it("throws InternalServerErrorException when the user has no role, e.g. used without RolesGuard", () => {
    const user: RequestUser = { uid: "u1", email: "a@x.com", role: undefined };
    expect(() => extractCurrentUser(makeContext(user))).toThrow(InternalServerErrorException);
  });
});
