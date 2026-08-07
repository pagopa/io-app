import { CredentialStatus } from "@pagopa/io-react-native-wallet";
import { AnyActorLogic, createActor } from "xstate";

import { useIOStore } from "../../../../../store/hooks";
import { Env } from "../../../common/utils/environment";
import { getIoWallet } from "../../../common/utils/itwIoWallet";
import { ItwStoredCredentialsMocks } from "../../../common/utils/itwMocksUtils";
import { itwCredentialsReplaceByType } from "../../../credentials/store/actions";
import {
  getCredentialStatusFromStatusList,
  getKeysForWuaStatusList
} from "../../../statusList/utils";
import { StatusListRepository } from "../../../statusList/utils/repository";
import {
  itwStoreWalletInstanceStatusList,
  itwWalletUnitAttestationsStore
} from "../../../walletInstance/store/actions";
import {
  createEidIssuanceActorsImplementation,
  ObtainStatusListActorOutput,
  StoreEidCredentialActorParams
} from "../actors";

jest.mock("../../../common/utils/itwIoWallet", () => ({
  getIoWallet: jest.fn()
}));

jest.mock("../../../statusList/utils", () => ({
  getCredentialStatusFromStatusList: jest.fn(),
  getKeysForWuaStatusList: jest.fn()
}));

jest.mock("../../../statusList/utils/repository", () => ({
  StatusListRepository: {
    upsert: jest.fn()
  }
}));

const mockGetIoWallet = jest.mocked(getIoWallet);
const mockGetCredentialStatus = jest.mocked(getCredentialStatusFromStatusList);
const mockGetKeys = jest.mocked(getKeysForWuaStatusList);
const mockUpsert = jest.mocked(StatusListRepository.upsert);

const ITW_VERSION = "1.3.3";
const WUA_STATUS_LIST_URI = "https://wallet-provider.example/status-list/1";
const STATUS_LIST_PAYLOAD: CredentialStatus.StatusList = {
  sub: WUA_STATUS_LIST_URI,
  iat: 1700000000,
  exp: 1700003600,
  status_list: { bits: 1, lst: "eNrbuRgAAhcBXQ" }
};
const KEYS = [{ kty: "EC" as const, kid: "wallet-provider-key" }];
const TRUST_ANCHOR_BASE_URL = "https://trust-anchor.example";
const EID = {
  credential: "eid-jwt",
  metadata: ItwStoredCredentialsMocks.eid
};

const createWallet = (
  walletUnitAttestationSupported = true,
  statusListSupported = true
) => ({
  WalletUnitAttestation: {
    isSupported: walletUnitAttestationSupported
  },
  CredentialStatus: {
    statusList: {
      isSupported: statusListSupported
    }
  }
});

const runActor = async <TOutput>(
  logic: AnyActorLogic,
  input: unknown
): Promise<TOutput> =>
  new Promise((resolve, reject) => {
    const actor = createActor(logic, { input });
    actor.subscribe({
      next: snapshot => {
        if (snapshot.status === "done") {
          resolve(snapshot.output as TOutput);
        }
      },
      error: reject
    });
    actor.start();
  });

describe("eID issuance actors", () => {
  const dispatch = jest.fn(
    (action: {
      meta?: {
        onComplete?: () => void;
        onError?: (error: Error) => void;
      };
      type: string;
    }) => {
      if (action.type === itwCredentialsReplaceByType.toString()) {
        action.meta?.onComplete?.();
      }
    }
  );
  const store = {
    dispatch,
    getState: jest.fn()
  } as unknown as ReturnType<typeof useIOStore>;
  const actors = createEidIssuanceActorsImplementation(
    { WALLET_TA_BASE_URL: TRUST_ANCHOR_BASE_URL } as Env,
    store
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("verifies the first WUA status list", async () => {
    mockGetIoWallet.mockReturnValue(createWallet() as never);
    mockGetKeys.mockResolvedValue(KEYS);
    mockGetCredentialStatus.mockResolvedValue({
      idx: 0,
      uri: WUA_STATUS_LIST_URI,
      parsedStatusList: STATUS_LIST_PAYLOAD,
      rawStatus: "0x00",
      status: "valid",
      statusList: "status-list-jwt"
    });

    const result = await runActor<ObtainStatusListActorOutput>(
      actors.obtainStatusList,
      {
        itwVersion: ITW_VERSION,
        walletUnitAttestations: {
          "wua-1": "wua-1-jwt",
          "wua-2": "wua-2-jwt"
        }
      }
    );

    expect(mockGetKeys).toHaveBeenCalledWith("wua-1-jwt");
    expect(mockGetCredentialStatus).toHaveBeenCalledWith(
      ITW_VERSION,
      "wua-1-jwt",
      "wua-1",
      "dc+sd-jwt",
      KEYS
    );
    expect(result).toEqual({
      idx: 0,
      uri: WUA_STATUS_LIST_URI,
      parsedStatusList: STATUS_LIST_PAYLOAD,
      rawStatus: "0x00",
      status: "valid",
      statusList: "status-list-jwt"
    });
  });

  it("fails when PID WUA is missing on supported versions", async () => {
    mockGetIoWallet.mockReturnValue(createWallet() as never);

    await expect(
      runActor(actors.obtainStatusList, {
        itwVersion: ITW_VERSION,
        walletUnitAttestations: undefined
      })
    ).rejects.toThrow("PID Wallet Unit Attestations are not defined or empty");
  });

  it("skips WUA status list verification when support is unavailable", async () => {
    mockGetIoWallet.mockReturnValue(createWallet(false) as never);

    await expect(
      runActor(actors.obtainStatusList, {
        itwVersion: ITW_VERSION,
        walletUnitAttestations: undefined
      })
    ).resolves.toBeUndefined();
    expect(mockGetCredentialStatus).not.toHaveBeenCalled();
  });

  it("propagates WUA verification failures", async () => {
    const error = new Error("invalid WUA status");
    mockGetIoWallet.mockReturnValue(createWallet() as never);
    mockGetKeys.mockResolvedValue(KEYS);
    mockGetCredentialStatus.mockRejectedValue(error);

    await expect(
      runActor(actors.obtainStatusList, {
        itwVersion: ITW_VERSION,
        walletUnitAttestations: { "wua-1": "wua-1-jwt" }
      })
    ).rejects.toBe(error);
  });

  it("persists status lists before WUAs and the eID", async () => {
    mockUpsert.mockResolvedValue();

    const input: StoreEidCredentialActorParams = {
      eid: {
        ...EID
      },
      walletUnitAttestations: { "wua-1": "wua-1-jwt" },
      walletInstanceStatusList: {
        idx: 0,
        parsedStatusList: STATUS_LIST_PAYLOAD,
        uri: WUA_STATUS_LIST_URI
      }
    };

    await expect(runActor(actors.storeEidCredential, input)).resolves.toBe(
      undefined
    );

    expect(mockUpsert).toHaveBeenCalledWith(
      WUA_STATUS_LIST_URI,
      STATUS_LIST_PAYLOAD
    );
    expect(dispatch.mock.calls.map(([action]) => action.type)).toEqual([
      itwStoreWalletInstanceStatusList.toString(),
      itwWalletUnitAttestationsStore.toString(),
      itwCredentialsReplaceByType.toString()
    ]);
  });

  it("does not store WUAs or the eID when status list persistence fails", async () => {
    const error = new Error("status list persistence failed");
    mockUpsert.mockRejectedValue(error);

    const input: StoreEidCredentialActorParams = {
      eid: {
        ...EID
      },
      walletUnitAttestations: { "wua-1": "wua-1-jwt" },
      walletInstanceStatusList: {
        idx: 0,
        parsedStatusList: STATUS_LIST_PAYLOAD,
        uri: WUA_STATUS_LIST_URI
      }
    };

    await expect(runActor(actors.storeEidCredential, input)).rejects.toBe(
      error
    );
    expect(dispatch).not.toHaveBeenCalled();
  });
});
