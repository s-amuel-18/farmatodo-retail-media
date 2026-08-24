/**
 * @jest-environment node
 *
 * NextRequest/NextResponse extend the platform's global Request/Response,
 * which jsdom (the project's default test environment) doesn't implement.
 * Node's environment provides them natively, so this file opts into it via
 * the docblock above instead of touching the shared jest.config.js.
 */
import { NextRequest } from "next/server";
import { middleware } from "./middleware";

function makeRequest(url: string, cookie?: string): NextRequest {
  const init: ConstructorParameters<typeof NextRequest>[1] = cookie
    ? { headers: new Headers({ cookie }) }
    : {};
  return new NextRequest(new URL(url), init);
}

describe("middleware", () => {
  it("redirects to /login when there is no session cookie", () => {
    const request = makeRequest("http://localhost/campaigns");
    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/login");
  });

  it("redirects to /login when the session cookie is present but not '1'", () => {
    const request = makeRequest("http://localhost/campaigns", "session=0");
    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/login");
  });

  it("redirects to /campaigns when a non-approver visits /approvals", () => {
    const request = makeRequest(
      "http://localhost/approvals",
      "session=1; role=COMMERCIAL_ANALYST",
    );
    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/campaigns");
  });

  it("redirects to /campaigns when visiting /approvals with no role cookie at all", () => {
    const request = makeRequest("http://localhost/approvals", "session=1");
    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/campaigns");
  });

  it("lets an APPROVER_MANAGER through to /approvals", () => {
    const request = makeRequest(
      "http://localhost/approvals",
      "session=1; role=APPROVER_MANAGER",
    );
    const response = middleware(request);

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects to /approvals when an APPROVER_MANAGER visits /campaigns", () => {
    const request = makeRequest(
      "http://localhost/campaigns",
      "session=1; role=APPROVER_MANAGER",
    );
    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/approvals");
  });

  it("lets a COMMERCIAL_ANALYST through to /campaigns", () => {
    const request = makeRequest(
      "http://localhost/campaigns",
      "session=1; role=COMMERCIAL_ANALYST",
    );
    const response = middleware(request);

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("preserves nested sub-paths when redirecting away from /approvals", () => {
    const request = makeRequest(
      "http://localhost/approvals/123",
      "session=1; role=COMMERCIAL_ANALYST",
    );
    const response = middleware(request);

    expect(response.headers.get("location")).toBe("http://localhost/campaigns");
  });
});
