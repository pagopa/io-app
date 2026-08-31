import { decode as decodeJwt } from "@pagopa/io-react-native-jwt";
import { CredentialStatus } from "@pagopa/io-react-native-wallet";
import { ZodError } from "zod";

import { getCredentialStatusFromStatusList, getKeysForWuaStatusList } from "..";
import { getIoWallet } from "../../../common/utils/itwIoWallet";
import { InvalidTslCredentialStatus } from "../errors";

jest.mock("@pagopa/io-react-native-jwt", () => ({
  decode: jest.fn()
}));

jest.mock("../../../common/utils/itwIoWallet", () => ({
  getIoWallet: jest.fn()
}));

const mockDecodeJwt = jest.mocked(decodeJwt);
const mockGetIoWallet = jest.mocked(getIoWallet);

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

const statusListPayload: CredentialStatus.StatusList = {
  sub: STATUS_LIST_URI,
  iat: 1700000000,
  exp: 1700003600,
  status_list: { bits: 1, lst: "eNrbuRgAAhcBXQ" }
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
      text: jest.fn().mockResolvedValue(FEDERATION_JWT)
    } as never);

    await expect(getKeysForWuaStatusList(WUA)).resolves.toEqual(KEYS);

    expect(mockDecodeJwt).toHaveBeenNthCalledWith(1, WUA);
    expect(fetchSpy).toHaveBeenCalledWith(
      `${ISSUER}/.well-known/openid-federation`
    );
    expect(mockDecodeJwt).toHaveBeenNthCalledWith(2, FEDERATION_JWT);
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
      text: jest.fn().mockResolvedValue(FEDERATION_JWT)
    } as never);

    await expect(getKeysForWuaStatusList(WUA)).rejects.toBeInstanceOf(ZodError);
  });
});
