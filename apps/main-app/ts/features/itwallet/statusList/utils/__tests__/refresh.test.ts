import { type CredentialStatus } from "@pagopa/io-react-native-wallet";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getKeysForStatusListToken } from "..";
import { STORAGE_KEY_LAST_CHECK_TIME } from "../consts";
import {
  refreshStaleEntries,
  refreshStatusListToken,
  refreshWithBoundedParallelism
} from "../refresh";
import { StatusListRepository } from "../repository";
import { type StatusListVerificationContext } from "../types";

const mockGetByUri = jest.fn<Promise<string>, [string]>();
const mockVerifyAndParse = jest.fn();

jest.mock("..", () => ({
  getKeysForStatusListToken: jest.fn()
}));

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("../../../common/utils/itwIoWallet", () => ({
  getIoWallet: jest.fn(() => ({
    CredentialStatus: {
      statusList: {
        isSupported: true,
        getByUri: mockGetByUri,
        verifyAndParse: mockVerifyAndParse
      }
    }
  }))
}));

const URI = "https://issuer.example/status/1";
const STATUS_LIST_TOKEN = "status-list-token";
const ROOT_CERTIFICATE = "root-certificate";
const KEYS = [{ kty: "EC" as const, kid: "status-list-key" }];

const mockGetKeysForStatusListToken = jest.mocked(getKeysForStatusListToken);

const context: StatusListVerificationContext = {
  itwVersion: "1.3.3",
  x509CertRoot: ROOT_CERTIFICATE
};

const makeValidPayload = (
  uri: string = URI,
  overrides: Partial<CredentialStatus.StatusList> = {}
): CredentialStatus.StatusList => ({
  sub: uri,
  iat: 1680000000,
  exp: 2291720170,
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

const mockStatusListToken = (
  payload: CredentialStatus.StatusList,
  token: string = STATUS_LIST_TOKEN
) => {
  mockGetByUri.mockResolvedValue(token);
  mockVerifyAndParse.mockResolvedValue(payload);
};

const flushPromises = () =>
  new Promise(resolve => {
    setTimeout(resolve, 0);
  });

describe("refreshStatusListToken", () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
    mockGetByUri.mockReset();
    mockGetKeysForStatusListToken.mockReset();
    mockGetKeysForStatusListToken.mockResolvedValue(KEYS);
    mockVerifyAndParse.mockReset();
    await AsyncStorage.clear();
  });

  it("gets, verifies, validates, and persists a valid token", async () => {
    const payload = makeValidPayload();
    mockStatusListToken(payload);

    const result = await refreshStatusListToken(context, URI);

    expect(result).toBe(true);
    expect(mockGetKeysForStatusListToken).toHaveBeenCalledWith(
      STATUS_LIST_TOKEN,
      ROOT_CERTIFICATE
    );
    expect(mockVerifyAndParse).toHaveBeenCalledWith(KEYS, STATUS_LIST_TOKEN);

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

  it("returns false when signature verification fails", async () => {
    mockGetByUri.mockResolvedValue(STATUS_LIST_TOKEN);
    mockVerifyAndParse.mockRejectedValue(new Error("invalid signature"));

    const result = await refreshStatusListToken(context, URI);

    expect(result).toBe(false);
    await expect(StatusListRepository.get(URI)).resolves.toBeFalsy();
  });

  it("returns false when certificate chain validation fails", async () => {
    mockGetByUri.mockResolvedValue(STATUS_LIST_TOKEN);
    mockGetKeysForStatusListToken.mockRejectedValue(
      new Error("untrusted certificate chain")
    );

    await expect(refreshStatusListToken(context, URI)).resolves.toBe(false);
    expect(mockVerifyAndParse).not.toHaveBeenCalled();
  });

  it("returns false when payload sub does not match requested sub", async () => {
    const wrongSub = {
      ...makeValidPayload(),
      sub: "https://issuer.example/status/wrong"
    };
    mockStatusListToken(wrongSub);

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
    mockStatusListToken(newPayload);

    const result = await refreshStatusListToken(context, URI);

    expect(result).toBe(true);
    const cached = await StatusListRepository.get(URI);
    expect(cached?.iat).toBe(1690000000);
  });
});

describe("refreshWithBoundedParallelism", () => {
  beforeEach(async () => {
    mockGetByUri.mockReset();
    mockGetKeysForStatusListToken.mockReset();
    mockGetKeysForStatusListToken.mockResolvedValue(KEYS);
    mockVerifyAndParse.mockReset();
    mockVerifyAndParse.mockImplementation((_, token: string) => {
      const parts = token.split(".");
      return Promise.resolve(
        JSON.parse(Buffer.from(parts[1], "base64url").toString())
      );
    });
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
    jest.restoreAllMocks();
    mockGetByUri.mockReset();
    mockGetKeysForStatusListToken.mockReset();
    mockGetKeysForStatusListToken.mockResolvedValue(KEYS);
    mockVerifyAndParse.mockReset();
    mockVerifyAndParse.mockImplementation((_, token: string) => {
      const parts = token.split(".");
      return Promise.resolve(
        JSON.parse(Buffer.from(parts[1], "base64url").toString())
      );
    });
    await AsyncStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("refreshes only stale entries", async () => {
    const freshUri = "https://issuer.example/status/fresh";
    const staleUri = "https://issuer.example/status/stale";
    const now = 1500000;
    jest.spyOn(Date, "now").mockReturnValue(now);
    mockGetByUri.mockImplementation(uri =>
      Promise.resolve(fakeJwt(makeValidPayload(uri)))
    );

    await StatusListRepository.upsert(
      freshUri,
      makeValidPayload(freshUri, { exp: 2000 })
    );
    await StatusListRepository.upsert(
      staleUri,
      makeValidPayload(staleUri, { exp: 1000 })
    );

    await refreshStaleEntries(context);

    expect(mockGetByUri).toHaveBeenCalledTimes(1);
    expect(mockGetByUri).toHaveBeenCalledWith(staleUri);
    await expect(StatusListRepository.get(freshUri)).resolves.toMatchObject({
      sub: freshUri,
      exp: 2000
    });
    await expect(StatusListRepository.get(staleUri)).resolves.toMatchObject({
      sub: staleUri
    });
    await expect(
      AsyncStorage.getItem(STORAGE_KEY_LAST_CHECK_TIME)
    ).resolves.toBe(JSON.stringify([now]));
  });
});
