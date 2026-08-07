import { CredentialStatus } from "@pagopa/io-react-native-wallet";
import { AnyActorLogic, createActor } from "xstate";

import { useIOStore } from "../../../../../store/hooks";
import { Env } from "../../../common/utils/environment";
import { getIoWallet } from "../../../common/utils/itwIoWallet";
import { ItwStoredCredentialsMocks } from "../../../common/utils/itwMocksUtils";
import { itwCredentialsReplaceByType } from "../../../credentials/store/actions";
import { getWuaStatusFromStatusList } from "../../../statusList/utils";
import { StatusListRepository } from "../../../statusList/utils/repository";
import { itwWalletUnitAttestationsStore } from "../../../walletInstance/store/actions";
import {
  createEidIssuanceActorsImplementation,
  ObtainEidWuaStatusListsActorOutput,
  StoreEidCredentialActorParams
} from "../actors";

jest.mock("../../../common/utils/itwIoWallet", () => ({
  getIoWallet: jest.fn()
}));

jest.mock("../../../statusList/utils", () => ({
  getWuaStatusFromStatusList: jest.fn()
}));

jest.mock("../../../statusList/utils/repository", () => ({
  StatusListRepository: {
    upsertMany: jest.fn()
  }
}));

const mockGetIoWallet = jest.mocked(getIoWallet);
const mockGetWuaStatus = jest.mocked(getWuaStatusFromStatusList);
const mockUpsertMany = jest.mocked(StatusListRepository.upsertMany);

const ITW_VERSION = "1.3.3";
const WUA_STATUS_LIST_URI = "https://wallet-provider.example/status-list/1";
const STATUS_LIST_PAYLOAD: CredentialStatus.StatusList = {
  sub: WUA_STATUS_LIST_URI,
  iat: 1700000000,
  exp: 1700003600,
  status_list: { bits: 1, lst: "eNrbuRgAAhcBXQ" }
};
const STATUS_LIST_PAYLOAD_2: CredentialStatus.StatusList = {
  ...STATUS_LIST_PAYLOAD,
  status_list: { bits: 1, lst: "eNrbuRgAAhcBYQ" }
};
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

  it("verifies every WUA and keeps the last payload for duplicate URIs", async () => {
    mockGetIoWallet.mockReturnValue(createWallet() as never);
    mockGetWuaStatus
      .mockResolvedValueOnce({
        idx: 0,
        uri: WUA_STATUS_LIST_URI,
        parsedStatusList: STATUS_LIST_PAYLOAD,
        rawStatus: "0x00",
        status: "valid",
        statusList: "status-list-jwt"
      })
      .mockResolvedValueOnce({
        idx: 1,
        uri: WUA_STATUS_LIST_URI,
        parsedStatusList: STATUS_LIST_PAYLOAD_2,
        rawStatus: "0x01",
        status: "valid",
        statusList: "status-list-jwt-2"
      });

    const result = await runActor<ObtainEidWuaStatusListsActorOutput>(
      actors.obtainWuaStatusLists,
      {
        itwVersion: ITW_VERSION,
        walletUnitAttestations: {
          "wua-1": "wua-1-jwt",
          "wua-2": "wua-2-jwt"
        }
      }
    );

    expect(mockGetWuaStatus).toHaveBeenCalledTimes(2);
    expect(mockGetWuaStatus).toHaveBeenNthCalledWith(
      1,
      ITW_VERSION,
      "wua-1-jwt",
      "wua-1"
    );
    expect(result).toEqual({
      [WUA_STATUS_LIST_URI]: STATUS_LIST_PAYLOAD_2
    });
  });

  it("fails when PID WUA is missing on supported versions", async () => {
    mockGetIoWallet.mockReturnValue(createWallet() as never);

    await expect(
      runActor(actors.obtainWuaStatusLists, {
        itwVersion: ITW_VERSION,
        walletUnitAttestations: undefined
      })
    ).rejects.toThrow("PID Wallet Unit Attestations are not defined or empty");
  });

  it("skips WUA status list verification when support is unavailable", async () => {
    mockGetIoWallet.mockReturnValue(createWallet(false) as never);

    await expect(
      runActor(actors.obtainWuaStatusLists, {
        itwVersion: ITW_VERSION,
        walletUnitAttestations: undefined
      })
    ).resolves.toBeUndefined();
    expect(mockGetWuaStatus).not.toHaveBeenCalled();
  });

  it("propagates WUA verification failures", async () => {
    const error = new Error("invalid WUA status");
    mockGetIoWallet.mockReturnValue(createWallet() as never);
    mockGetWuaStatus.mockRejectedValue(error);

    await expect(
      runActor(actors.obtainWuaStatusLists, {
        itwVersion: ITW_VERSION,
        walletUnitAttestations: { "wua-1": "wua-1-jwt" }
      })
    ).rejects.toBe(error);
  });

  it("persists status lists before WUAs and the eID", async () => {
    mockUpsertMany.mockResolvedValue();

    const input: StoreEidCredentialActorParams = {
      eid: {
        ...EID
      },
      walletUnitAttestations: { "wua-1": "wua-1-jwt" },
      walletUnitAttestationStatusLists: {
        [WUA_STATUS_LIST_URI]: STATUS_LIST_PAYLOAD
      }
    };

    await expect(runActor(actors.storeEidCredential, input)).resolves.toBe(
      undefined
    );

    expect(mockUpsertMany).toHaveBeenCalledWith([
      [WUA_STATUS_LIST_URI, STATUS_LIST_PAYLOAD]
    ]);
    expect(dispatch.mock.calls.map(([action]) => action.type)).toEqual([
      itwWalletUnitAttestationsStore.toString(),
      itwCredentialsReplaceByType.toString()
    ]);
  });

  it("does not store WUAs or the eID when status list persistence fails", async () => {
    const error = new Error("status list persistence failed");
    mockUpsertMany.mockRejectedValue(error);

    const input: StoreEidCredentialActorParams = {
      eid: {
        ...EID
      },
      walletUnitAttestations: { "wua-1": "wua-1-jwt" },
      walletUnitAttestationStatusLists: {
        [WUA_STATUS_LIST_URI]: STATUS_LIST_PAYLOAD
      }
    };

    await expect(runActor(actors.storeEidCredential, input)).rejects.toBe(
      error
    );
    expect(dispatch).not.toHaveBeenCalled();
  });
});
