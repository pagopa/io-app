import { CredentialStatus } from "@pagopa/io-react-native-wallet";

import { getWalletUnitAttestationStatusFromStatusList } from "..";
import { getIoWallet } from "../../../common/utils/itwIoWallet";
import { InvalidTslWuaStatus } from "../errors";

jest.mock("../../../common/utils/itwIoWallet", () => ({
  getIoWallet: jest.fn()
}));

const mockGetIoWallet = jest.mocked(getIoWallet);

const WUA_ID = "wua-id";
const WUA = "wua-jwt";
const ITW_VERSION = "1.3.3";
const STATUS_LIST_URI = "https://wallet-provider.example/status-list/1";
const STATUS_LIST = "status-list-jwt";
const STATUS_LIST_INDEX = 1;
const KEYS = [{ kty: "EC" as const, kid: "wallet-provider-key" }];

const statusListPayload: CredentialStatus.StatusList = {
  sub: STATUS_LIST_URI,
  iat: 1700000000,
  exp: 1700003600,
  status_list: { bits: 1, lst: "eNrbuRgAAhcBXQ" }
};

const makeWallet = (
  status = "VALID",
  sub = STATUS_LIST_URI,
  statusListSupported = true
) => ({
  CredentialStatus: {
    statusList: {
      isSupported: statusListSupported,
      getByUri: jest.fn().mockResolvedValue(STATUS_LIST),
      verifyAndParse: jest.fn().mockResolvedValue({
        ...statusListPayload,
        sub
      }),
      getStatus: jest.fn().mockReturnValue({
        rawStatus: "0x00",
        status
      })
    }
  },
  WalletUnitAttestation: {
    isSupported: true,
    decode: jest.fn().mockReturnValue({
      status: {
        status_list: { idx: STATUS_LIST_INDEX, uri: STATUS_LIST_URI }
      }
    })
  }
});

describe("getWalletUnitAttestationStatusFromStatusList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches, verifies, parses, and returns a valid WUA status", async () => {
    const wallet = makeWallet();
    mockGetIoWallet.mockReturnValue(wallet as never);

    await expect(
      getWalletUnitAttestationStatusFromStatusList(
        WUA_ID,
        WUA,
        ITW_VERSION,
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
    expect(wallet.WalletUnitAttestation.decode).toHaveBeenCalledWith(WUA);
    expect(wallet.CredentialStatus.statusList.getByUri).toHaveBeenCalledWith(
      STATUS_LIST_URI
    );
    expect(
      wallet.CredentialStatus.statusList.verifyAndParse
    ).toHaveBeenCalledWith(KEYS, STATUS_LIST);
    expect(wallet.CredentialStatus.statusList.getStatus).toHaveBeenCalledWith(
      statusListPayload.status_list,
      STATUS_LIST_INDEX
    );
  });

  it("throws when WUA status is not valid", async () => {
    const wallet = makeWallet("INVALID");
    mockGetIoWallet.mockReturnValue(wallet as never);

    await expect(
      getWalletUnitAttestationStatusFromStatusList(
        WUA_ID,
        WUA,
        ITW_VERSION,
        KEYS
      )
    ).rejects.toEqual(new InvalidTslWuaStatus(WUA_ID));
  });

  it("throws when status list subject does not match WUA reference", async () => {
    const wallet = makeWallet("VALID", "https://other.example/status-list");
    mockGetIoWallet.mockReturnValue(wallet as never);

    await expect(
      getWalletUnitAttestationStatusFromStatusList(
        WUA_ID,
        WUA,
        ITW_VERSION,
        KEYS
      )
    ).rejects.toThrow(
      `Status List Token sub does not match URI ${STATUS_LIST_URI}`
    );
  });

  it("throws when Status List is unsupported", async () => {
    const wallet = makeWallet("VALID", STATUS_LIST_URI, false);
    mockGetIoWallet.mockReturnValue(wallet as never);

    await expect(
      getWalletUnitAttestationStatusFromStatusList(
        WUA_ID,
        WUA,
        ITW_VERSION,
        KEYS
      )
    ).rejects.toThrow(
      `Status List is not supported by IT-Wallet v${ITW_VERSION}`
    );
  });
});
