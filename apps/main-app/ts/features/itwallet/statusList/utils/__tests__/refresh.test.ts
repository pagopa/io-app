import AsyncStorage from "@react-native-async-storage/async-storage";
import { type CredentialStatus } from "@pagopa/io-react-native-wallet";
import { StatusListRepository } from "../repository";
import {
  refreshStaleEntries,
  refreshStatusListToken,
  refreshWithBoundedParallelism
} from "../refresh";
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

const makeValidPayload = (
  uri: string = URI,
  overrides: Partial<CredentialStatus.StatusList> = {}
): CredentialStatus.StatusList => ({
  sub: uri,
  iat: 1680000000,
  exp: 1700000000,
  status_list: { bits: 2 as const, lst: "eNrbuRgAAhcBXQ" },
  ...overrides
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

const flushPromises = () =>
  new Promise(resolve => {
    setTimeout(resolve, 0);
  });

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
    await expect(StatusListRepository.get(URI)).resolves.toBeFalsy();
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
    await expect(StatusListRepository.get(URI)).resolves.toBeDefined();
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

describe("refreshWithBoundedParallelism", () => {
  beforeEach(async () => {
    mockGetByUri.mockReset();
    await AsyncStorage.clear();
  });

  it("refreshes at most three status lists at a time", async () => {
    const uris = Array.from(
      { length: 5 },
      (_, idx) => `https://issuer.example/status/${idx + 1}`
    );
    const resolvers = new Map<string, (jwt: string) => void>();

    mockGetByUri.mockImplementation(
      uri =>
        new Promise(resolve => {
          resolvers.set(uri, resolve);
        })
    );

    const refresh = refreshWithBoundedParallelism(context, uris);

    expect(mockGetByUri).toHaveBeenCalledTimes(3);
    expect(mockGetByUri).toHaveBeenNthCalledWith(1, uris[0]);
    expect(mockGetByUri).toHaveBeenNthCalledWith(2, uris[1]);
    expect(mockGetByUri).toHaveBeenNthCalledWith(3, uris[2]);

    uris.slice(0, 3).forEach(uri => {
      resolvers.get(uri)?.(fakeJwt(makeValidPayload(uri)));
    });
    await flushPromises();

    expect(mockGetByUri).toHaveBeenCalledTimes(5);

    uris.slice(3).forEach(uri => {
      resolvers.get(uri)?.(fakeJwt(makeValidPayload(uri)));
    });
    await refresh;

    const cached = await StatusListRepository.list();
    expect(cached.map(payload => payload.sub).sort()).toEqual(uris);
  });
});

describe("refreshStaleEntries", () => {
  beforeEach(async () => {
    mockGetByUri.mockReset();
    await AsyncStorage.clear();
  });

  it("refreshes only stale entries", async () => {
    const freshUri = "https://issuer.example/status/fresh";
    const staleUri = "https://issuer.example/status/stale";
    mockGetByUri.mockImplementation(uri =>
      Promise.resolve(fakeJwt(makeValidPayload(uri)))
    );

    await refreshStaleEntries(
      [
        makeValidPayload(freshUri, { exp: 2000 }),
        makeValidPayload(staleUri, { exp: 1000 })
      ],
      context,
      1500000
    );

    expect(mockGetByUri).toHaveBeenCalledTimes(1);
    expect(mockGetByUri).toHaveBeenCalledWith(staleUri);
    await expect(StatusListRepository.get(freshUri)).resolves.toBeUndefined();
    await expect(StatusListRepository.get(staleUri)).resolves.toMatchObject({
      sub: staleUri
    });
  });
});
