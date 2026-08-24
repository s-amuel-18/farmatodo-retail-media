import { render } from "@testing-library/react";
import RootPage from "./page";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock("../view-models/session/session-context", () => ({
  useSession: jest.fn(),
}));

import { useSession } from "../view-models/session/session-context";

describe("RootPage", () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it("renders nothing", () => {
    (useSession as jest.Mock).mockReturnValue({ user: null, isLoading: true });
    const { container } = render(<RootPage />);
    expect(container).toBeEmptyDOMElement();
  });

  it("does not redirect while the session is loading", () => {
    (useSession as jest.Mock).mockReturnValue({ user: null, isLoading: true });
    render(<RootPage />);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("redirects to /login when there is no user", () => {
    (useSession as jest.Mock).mockReturnValue({ user: null, isLoading: false });
    render(<RootPage />);
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("redirects to the role home route when the user has a role", () => {
    (useSession as jest.Mock).mockReturnValue({
      user: { uid: "1", email: "a@b.com", displayName: "A", role: "APPROVER_MANAGER" },
      isLoading: false,
    });
    render(<RootPage />);
    expect(mockReplace).toHaveBeenCalledWith("/approvals");
  });

  it("does not redirect when the user has no role assigned yet", () => {
    (useSession as jest.Mock).mockReturnValue({
      user: { uid: "1", email: "a@b.com", displayName: "A", role: null },
      isLoading: false,
    });
    render(<RootPage />);
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
