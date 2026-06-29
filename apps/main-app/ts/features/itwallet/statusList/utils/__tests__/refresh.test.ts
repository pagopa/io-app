import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusListRepository } from "../repository";
import { refreshStatusListToken } from "../refresh";
import { type StatusListContext } from "../types";

const mockGetByUri = jest.fn<Promise<string>, [string]>();

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("../../../common/utils/itwIoWallet", () => ({
  getIoWallet: jest.fn(() => ({
    CredentialStatus: {
      statusList: {
        isSupported: true,
        getByUri: mockGetByUri
      }
    }
  }))
}));

/**
 * Mock the JWT decode function to extract the payload from a fake JWT.
 * The fake JWT format is: base64url(header).base64url(payload).signature
 */
jest.mock("@pagopa/io-react-native-jwt", () => ({
  decode: (jwt: string) => {
    const parts = jwt.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    return { payload };
  }
}));

const URI = "https://issuer.example/status/1";

const context: StatusListContext = { itwVersion: "1.3.3" };

const makeValidPayload = () => ({
  sub: URI,
  iat: 1680000000,
  exp: 1700000000,
  status_list: { bits: 2 as const, lst: "eNrbuRgAAhcBXQ" }
});

/**
 * Encodes a payload as a fake JWT (header.payload.signature).
 * Uses base64url encoding for the payload portion.
 */
const fakeJwt = (payload: Record<string, unknown>): string => {
  const header = Buffer.from(JSON.stringify({ alg: "none" })).toString(
    "base64url"
  );
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.signature`;
};

const mockStatusListToken = (jwt: string) => {
  mockGetByUri.mockResolvedValue(jwt);
};

describe("refreshStatusListToken", () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
    mockGetByUri.mockReset();
    await AsyncStorage.clear();
  });

  it("gets, decodes, validates, and persists a valid token", async () => {
    const payload = makeValidPayload();
    mockStatusListToken(fakeJwt(payload));

    const result = await refreshStatusListToken(context, URI);

    expect(result).toBe(true);

    const cached = await StatusListRepository.get(URI);
    expect(cached).toBeDefined();
    expect(cached?.sub).toBe(URI);
  });

  it("returns false when status list fetch fails", async () => {
    mockGetByUri.mockRejectedValue(new Error("status list fetch failed"));

    const result = await refreshStatusListToken(context, URI);

    expect(result).toBe(false);
    expect(await StatusListRepository.get(URI)).toBeUndefined();
  });

  it("returns false for malformed payload", async () => {
    mockStatusListToken(fakeJwt({ sub: URI }));

    const result = await refreshStatusListToken(context, URI);

    expect(result).toBe(false);
  });

  it("returns false when payload sub does not match requested sub", async () => {
    const wrongSub = {
      ...makeValidPayload(),
      sub: "https://issuer.example/status/wrong"
    };
    mockStatusListToken(fakeJwt(wrongSub));

    const result = await refreshStatusListToken(context, URI);

    expect(result).toBe(false);
  });

  it("returns false when fetch throws", async () => {
    mockGetByUri.mockRejectedValue(new Error("network error"));

    const result = await refreshStatusListToken(context, URI);

    expect(result).toBe(false);
  });

  it("does not evict existing cached entry on failure", async () => {
    const payload = makeValidPayload();
    await StatusListRepository.upsert(URI, payload);

    mockGetByUri.mockRejectedValue(new Error("network error"));

    const result = await refreshStatusListToken(context, URI);

    expect(result).toBe(false);
    expect(await StatusListRepository.get(URI)).toBeDefined();
  });

  it("overwrites existing entry on successful refresh", async () => {
    const oldPayload = makeValidPayload();
    await StatusListRepository.upsert(URI, oldPayload);

    const newPayload = { ...makeValidPayload(), iat: 1690000000 };
    mockStatusListToken(fakeJwt(newPayload));

    const result = await refreshStatusListToken(context, URI);

    expect(result).toBe(true);
    const cached = await StatusListRepository.get(URI);
    expect(cached?.iat).toBe(1690000000);
  });
});
