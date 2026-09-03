import { verifyCertificateChain } from "@pagopa/io-react-native-crypto";
import { decode as decodeJwt } from "@pagopa/io-react-native-jwt";
import { CredentialStatus } from "@pagopa/io-react-native-wallet";
import { KEYUTIL, X509 } from "jsrsasign";
import { ZodError } from "zod";

import {
  getCredentialStatusFromStatusList,
  getKeysForStatusListToken
} from "..";
import { getIoWallet } from "../../../common/utils/itwIoWallet";
import { InvalidTslCredentialStatus } from "../errors";

jest.mock("@pagopa/io-react-native-crypto", () => ({
  verifyCertificateChain: jest.fn()
}));

jest.mock("@pagopa/io-react-native-jwt", () => ({
  decode: jest.fn()
}));

jest.mock("jsrsasign", () => {
  const ECDSA = jest.fn();
  const certificatePublicKey = new ECDSA();

  return {
    KEYUTIL: { getJWKFromKey: jest.fn() },
    KJUR: { crypto: { ECDSA } },
    RSAKey: jest.fn(),
    X509: jest.fn().mockImplementation(() => ({
      getPublicKey: jest.fn().mockReturnValue(certificatePublicKey),
      readCertPEM: jest.fn()
    }))
  };
});

jest.mock("../../../common/utils/itwIoWallet", () => ({
  getIoWallet: jest.fn()
}));

const mockDecodeJwt = jest.mocked(decodeJwt);
const mockGetIoWallet = jest.mocked(getIoWallet);
const mockGetJwkFromKey = jest.mocked(KEYUTIL.getJWKFromKey);
const mockVerifyCertificateChain = jest.mocked(verifyCertificateChain);
const mockX509 = jest.mocked(X509);

declare const global: { fetch: typeof fetch };

const CREDENTIAL_ID = "credential-id";
const CREDENTIAL = "credential-jwt";
const CREDENTIAL_FORMAT = "dc+sd-jwt";
const WUA = "wua-jwt";
const ITW_VERSION = "1.3.3";
const ISSUER = "https://wallet-provider.example";
const FEDERATION_JWT = "federation-jwt";
const STATUS_LIST_URI = `${ISSUER}/status-list/1`;
const STATUS_LIST = "status-list-jwt";
const STATUS_LIST_INDEX = 1;
const KEYS = [{ kty: "EC" as const, kid: "wallet-provider-key" }];
const LEAF_CERTIFICATE = "leaf-certificate";
const INTERMEDIATE_CERTIFICATE = "intermediate-certificate";
const ROOT_CERTIFICATE = "root-certificate";
const STATUS_LIST_KEY_ID = "status-list-key";
const CERTIFICATE_JWK = {
  crv: "P-256",
  kty: "EC" as const,
  x: "x-coordinate",
  y: "y-coordinate"
};

const statusListPayload: CredentialStatus.StatusList = {
  sub: STATUS_LIST_URI,
  iat: 1700000000,
  exp: 2291720170,
  status_list: { bits: 1, lst: "eNrbuRgAAhcBXQ" }
};

const mockSuccessfulCertificateValidation = () => {
  mockDecodeJwt.mockReturnValue({
    payload: statusListPayload,
    protectedHeader: {
      alg: "ES256",
      kid: STATUS_LIST_KEY_ID,
      x5c: [LEAF_CERTIFICATE, INTERMEDIATE_CERTIFICATE]
    }
  });
  mockVerifyCertificateChain.mockResolvedValue({
    errorMessage: "",
    isValid: true,
    validationStatus: "VALID" as never
  });
  mockGetJwkFromKey.mockReturnValue(CERTIFICATE_JWK as never);
};

const makeWallet = (status = "VALID", statusListSupported = true) => ({
  CredentialStatus: {
    statusList: {
      isSupported: statusListSupported,
      get: jest.fn().mockResolvedValue({
        idx: STATUS_LIST_INDEX,
        statusList: STATUS_LIST,
        uri: STATUS_LIST_URI
      }),
      verifyAndParse: jest.fn().mockResolvedValue(statusListPayload),
      getStatus: jest.fn().mockReturnValue({
        rawStatus: "0x00",
        status
      })
    }
  }
});

describe("getKeysForStatusListToken", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSuccessfulCertificateValidation();
  });

  it("returns leaf certificate key after validating the complete chain", async () => {
    await expect(
      getKeysForStatusListToken(STATUS_LIST, ROOT_CERTIFICATE)
    ).resolves.toEqual([{ ...CERTIFICATE_JWK, kid: STATUS_LIST_KEY_ID }]);

    expect(mockDecodeJwt).toHaveBeenCalledWith(STATUS_LIST);
    expect(mockVerifyCertificateChain).toHaveBeenCalledWith(
      [LEAF_CERTIFICATE, INTERMEDIATE_CERTIFICATE],
      ROOT_CERTIFICATE,
      expect.any(Object)
    );
    expect(mockGetJwkFromKey).toHaveBeenCalledTimes(1);
    expect(mockVerifyCertificateChain.mock.invocationCallOrder[0]).toBeLessThan(
      mockX509.mock.invocationCallOrder[0]
    );
  });

  it("rejects an untrusted certificate chain before extracting its public key", async () => {
    mockVerifyCertificateChain.mockResolvedValue({
      errorMessage: "trust anchor mismatch",
      isValid: false,
      validationStatus: "INVALID_TRUST_ANCHOR" as never
    });

    await expect(
      getKeysForStatusListToken(STATUS_LIST, ROOT_CERTIFICATE)
    ).rejects.toThrow("INVALID_TRUST_ANCHOR");

    expect(mockX509).not.toHaveBeenCalled();
  });

  it.each([
    ["missing", undefined],
    ["empty", []],
    ["malformed", [LEAF_CERTIFICATE, 1]]
  ])("rejects %s x5c", async (_, x5c) => {
    mockDecodeJwt.mockReturnValue({
      payload: statusListPayload,
      protectedHeader: { alg: "ES256", x5c }
    } as never);

    await expect(
      getKeysForStatusListToken(STATUS_LIST, ROOT_CERTIFICATE)
    ).rejects.toThrow();

    expect(mockVerifyCertificateChain).not.toHaveBeenCalled();
  });

  it("rejects an expired certificate chain", async () => {
    mockVerifyCertificateChain.mockResolvedValue({
      errorMessage: "certificate expired",
      isValid: false,
      validationStatus: "CERTIFICATE_EXPIRED" as never
    });

    await expect(
      getKeysForStatusListToken(STATUS_LIST, ROOT_CERTIFICATE)
    ).rejects.toThrow("CERTIFICATE_EXPIRED");
  });
});

describe("getCredentialStatusFromStatusList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns valid credential status", async () => {
    const wallet = makeWallet();
    mockGetIoWallet.mockReturnValue(wallet as never);

    await expect(
      getCredentialStatusFromStatusList(
        ITW_VERSION,
        CREDENTIAL,
        CREDENTIAL_ID,
        CREDENTIAL_FORMAT,
        KEYS
      )
    ).resolves.toEqual({
      idx: STATUS_LIST_INDEX,
      parsedStatusList: statusListPayload,
      rawStatus: "0x00",
      status: "valid",
      statusList: STATUS_LIST,
      uri: STATUS_LIST_URI
    });

    expect(mockGetIoWallet).toHaveBeenCalledWith(ITW_VERSION);
    expect(wallet.CredentialStatus.statusList.get).toHaveBeenCalledWith(
      CREDENTIAL,
      CREDENTIAL_FORMAT
    );
    expect(
      wallet.CredentialStatus.statusList.verifyAndParse
    ).toHaveBeenCalledWith(KEYS, STATUS_LIST);
    expect(wallet.CredentialStatus.statusList.getStatus).toHaveBeenCalledWith(
      statusListPayload.status_list,
      STATUS_LIST_INDEX
    );
  });

  it("throws when Status List Token sub does not match its URI", async () => {
    const wallet = makeWallet();
    wallet.CredentialStatus.statusList.verifyAndParse.mockResolvedValue({
      ...statusListPayload,
      sub: `${ISSUER}/status-list/wrong`
    });
    mockGetIoWallet.mockReturnValue(wallet as never);

    await expect(
      getCredentialStatusFromStatusList(
        ITW_VERSION,
        CREDENTIAL,
        CREDENTIAL_ID,
        CREDENTIAL_FORMAT,
        KEYS
      )
    ).rejects.toThrow(
      `Status List Token sub does not match URI ${STATUS_LIST_URI}`
    );
    expect(wallet.CredentialStatus.statusList.getStatus).not.toHaveBeenCalled();
  });

  it("throws when credential status is not valid", async () => {
    mockGetIoWallet.mockReturnValue(makeWallet("INVALID") as never);

    await expect(
      getCredentialStatusFromStatusList(
        ITW_VERSION,
        CREDENTIAL,
        CREDENTIAL_ID,
        CREDENTIAL_FORMAT,
        KEYS
      )
    ).rejects.toEqual(new InvalidTslCredentialStatus(CREDENTIAL_ID, "0x00"));
  });

  it("throws when Status List is unsupported", async () => {
    mockGetIoWallet.mockReturnValue(makeWallet("VALID", false) as never);

    await expect(
      getCredentialStatusFromStatusList(
        ITW_VERSION,
        CREDENTIAL,
        CREDENTIAL_ID,
        CREDENTIAL_FORMAT,
        KEYS
      )
    ).rejects.toThrow(`Status List is not supported by API ${ITW_VERSION}`);
  });
});

describe("getKeysForWuaStatusList", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("retrieves wallet provider keys", async () => {
    mockDecodeJwt
      .mockReturnValueOnce({ payload: { iss: ISSUER } } as never)
      .mockReturnValueOnce({
        payload: {
          metadata: {
            wallet_solution: {
              jwks: { keys: KEYS }
            }
          }
        }
      } as never);
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(FEDERATION_JWT)
    } as never);

    await expect(
      getKeysForStatusListToken(WUA, ROOT_CERTIFICATE)
    ).resolves.toEqual(KEYS);

    expect(mockDecodeJwt).toHaveBeenNthCalledWith(1, WUA);
    expect(fetchSpy).toHaveBeenCalledWith(
      `${ISSUER}/.well-known/openid-federation`
    );
    expect(mockDecodeJwt).toHaveBeenNthCalledWith(2, FEDERATION_JWT);
  });

  it("retrieves wallet provider keys from WUA x5c", async () => {
    mockSuccessfulCertificateValidation();

    await expect(
      getKeysForStatusListToken(WUA, ROOT_CERTIFICATE)
    ).resolves.toEqual([{ ...CERTIFICATE_JWK, kid: STATUS_LIST_KEY_ID }]);

    expect(mockVerifyCertificateChain).toHaveBeenCalledWith(
      [LEAF_CERTIFICATE, INTERMEDIATE_CERTIFICATE],
      ROOT_CERTIFICATE,
      expect.any(Object)
    );
  });

  it.each([
    ["missing metadata", {}],
    [
      "invalid JWKS keys",
      {
        metadata: {
          wallet_solution: {
            jwks: { keys: [{ kid: "missing-kty" }] }
          }
        }
      }
    ]
  ])("rejects %s", async (_, payload) => {
    mockDecodeJwt
      .mockReturnValueOnce({ payload: { iss: ISSUER } } as never)
      .mockReturnValueOnce({ payload } as never);
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(FEDERATION_JWT)
    } as never);

    await expect(
      getKeysForStatusListToken(WUA, ROOT_CERTIFICATE)
    ).rejects.toBeInstanceOf(ZodError);
  });
});
