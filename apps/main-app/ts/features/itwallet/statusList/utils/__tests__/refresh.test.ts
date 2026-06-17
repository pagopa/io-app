import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusListRepository } from "../repository";
import { refreshStatusListToken } from "../refresh";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

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

const makeValidPayload = () => ({
  sub: URI,
  exp: 1700000000,
  status_list: { bits: 2, lst: "eNrbuRgAAhcBXQ" }
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

const mockFetch = (jwt: string, ok = true) => {
  jest.spyOn(globalThis, "fetch").mockResolvedValue({
    ok,
    text: jest.fn().mockResolvedValue(jwt)
  } as unknown as Response);
};

describe("refreshStatusListToken", () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
    await AsyncStorage.clear();
  });

  it("fetches, decodes, validates, and persists a valid token", async () => {
    const payload = makeValidPayload();
    mockFetch(fakeJwt(payload));

    const result = await refreshStatusListToken(URI);

    expect(result).toBe(true);

    const cached = await StatusListRepository.get(URI);
    expect(cached).toBeDefined();
    expect(cached?.payload.sub).toBe(URI);
  });

  it("returns false when fetch response is not ok", async () => {
    mockFetch(fakeJwt(makeValidPayload()), false);

    const result = await refreshStatusListToken(URI);

    expect(result).toBe(false);
    expect(await StatusListRepository.get(URI)).toBeUndefined();
  });

  it("returns false for malformed payload", async () => {
    mockFetch(fakeJwt({ sub: URI }));

    const result = await refreshStatusListToken(URI);

    expect(result).toBe(false);
  });

  it("returns false when payload sub does not match requested sub", async () => {
    const wrongSub = {
      ...makeValidPayload(),
      sub: "https://issuer.example/status/wrong"
    };
    mockFetch(fakeJwt(wrongSub));

    const result = await refreshStatusListToken(URI);

    expect(result).toBe(false);
  });

  it("returns false when fetch throws", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("network error"));

    const result = await refreshStatusListToken(URI);

    expect(result).toBe(false);
  });

  it("does not evict existing cached entry on failure", async () => {
    const payload = makeValidPayload();
    await StatusListRepository.upsert(URI, payload, Date.now());

    jest
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("network error"));

    const result = await refreshStatusListToken(URI);

    expect(result).toBe(false);
    expect(await StatusListRepository.get(URI)).toBeDefined();
  });

  it("overwrites existing entry on successful refresh", async () => {
    const oldPayload = makeValidPayload();
    await StatusListRepository.upsert(URI, oldPayload, 1000);

    const newPayload = { ...makeValidPayload(), ttl: 7200 };
    mockFetch(fakeJwt(newPayload));

    const result = await refreshStatusListToken(URI);

    expect(result).toBe(true);
    const cached = await StatusListRepository.get(URI);
    expect(cached?.payload.ttl).toBe(7200);
    expect(cached?.meta.resolvedAt).toBeGreaterThan(1000);
  });
});
