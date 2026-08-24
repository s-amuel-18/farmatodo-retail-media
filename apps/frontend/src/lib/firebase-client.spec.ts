const mockGetApps = jest.fn();
const mockInitializeApp = jest.fn();
const mockGetAuth = jest.fn();
const mockGetFirestore = jest.fn();

jest.mock("firebase/app", () => ({
  getApps: (...args: unknown[]) => mockGetApps(...args),
  initializeApp: (...args: unknown[]) => mockInitializeApp(...args),
}));

jest.mock("firebase/auth", () => ({
  getAuth: (...args: unknown[]) => mockGetAuth(...args),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: (...args: unknown[]) => mockGetFirestore(...args),
}));

const ENV_KEYS = [
  "NEXT_PUBLIC_FB_API_KEY",
  "NEXT_PUBLIC_FB_AUTH_DOMAIN",
  "NEXT_PUBLIC_FB_PROJECT_ID",
  "NEXT_PUBLIC_FB_APP_ID",
] as const;

describe("firebase-client", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    mockGetApps.mockReset();
    mockInitializeApp.mockReset();
    mockGetAuth.mockReset();
    mockGetFirestore.mockReset();
    for (const key of ENV_KEYS) delete process.env[key];
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("initializes a new app when none exist yet, using env-derived config", () => {
    process.env.NEXT_PUBLIC_FB_API_KEY = "api-key-123";
    process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN = "example.firebaseapp.com";
    process.env.NEXT_PUBLIC_FB_PROJECT_ID = "example-project";
    process.env.NEXT_PUBLIC_FB_APP_ID = "app-id-456";

    mockGetApps.mockReturnValue([]);
    const fakeApp = { name: "[DEFAULT]" };
    mockInitializeApp.mockReturnValue(fakeApp);
    const fakeAuth = { auth: true };
    const fakeFirestore = { firestore: true };
    mockGetAuth.mockReturnValue(fakeAuth);
    mockGetFirestore.mockReturnValue(fakeFirestore);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require("./firebase-client");

    expect(mockInitializeApp).toHaveBeenCalledTimes(1);
    expect(mockInitializeApp).toHaveBeenCalledWith({
      apiKey: "api-key-123",
      authDomain: "example.firebaseapp.com",
      projectId: "example-project",
      appId: "app-id-456",
    });
    expect(mod.firebaseApp).toBe(fakeApp);
    expect(mockGetAuth).toHaveBeenCalledWith(fakeApp);
    expect(mockGetFirestore).toHaveBeenCalledWith(fakeApp);
    expect(mod.firebaseAuth).toBe(fakeAuth);
    expect(mod.firestoreClient).toBe(fakeFirestore);
  });

  it("reuses an existing app instead of initializing a new one", () => {
    const existingApp = { name: "existing" };
    mockGetApps.mockReturnValue([existingApp]);
    const fakeAuth = { auth: "existing-auth" };
    const fakeFirestore = { firestore: "existing-firestore" };
    mockGetAuth.mockReturnValue(fakeAuth);
    mockGetFirestore.mockReturnValue(fakeFirestore);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require("./firebase-client");

    expect(mockInitializeApp).not.toHaveBeenCalled();
    expect(mod.firebaseApp).toBe(existingApp);
    expect(mockGetAuth).toHaveBeenCalledWith(existingApp);
    expect(mockGetFirestore).toHaveBeenCalledWith(existingApp);
    expect(mod.firebaseAuth).toBe(fakeAuth);
    expect(mod.firestoreClient).toBe(fakeFirestore);
  });
});
