import { CredentialStatus } from "@pagopa/io-react-native-wallet";
import { AnyActorLogic, createActor } from "xstate";

import { useIOStore } from "../../../../../store/hooks";
import { Env } from "../../../common/utils/environment";
import { getIoWallet } from "../../../common/utils/itwIoWallet";
import { ItwStoredCredentialsMocks } from "../../../common/utils/itwMocksUtils";
import { itwCredentialsReplaceByType } from "../../../credentials/store/actions";
import { getWalletUnitAttestationStatusFromStatusList } from "../../../statusList/utils";
import { StatusListRepository } from "../../../statusList/utils/repository";
import { itwWalletUnitAttestationsStore } from "../../../walletInstance/store/actions";
import {
  createEidIssuanceActorsImplementation,
  StoreEidCredentialActorParams
} from "../actors";
import { AuthenticationContext, StatusListEntry } from "../context";

jest.mock("../../../common/utils/itwIoWallet", () => ({
  getIoWallet: jest.fn()
}));

jest.mock("../../../statusList/utils", () => ({
  getWalletUnitAttestationStatusFromStatusList: jest.fn()
}));

jest.mock("../../../statusList/utils/repository", () => ({
  StatusListRepository: {
    upsertMany: jest.fn()
  }
}));

const mockGetIoWallet = jest.mocked(getIoWallet);
const mockGetWuaStatus = jest.mocked(
  getWalletUnitAttestationStatusFromStatusList
);
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
const KEYS = [{ kty: "EC" as const, kid: "issuer-key" }];

const authenticationContext = {
  authUrl: "",
  callbackUrl: "",
  clientId: "",
  codeVerifier: "",
  credentialDefinition: {} as AuthenticationContext["credentialDefinition"],
  issuerConf: {
    credential_issuer: "",
    pushed_authorization_request_endpoint: "",
    authorization_endpoint: "",
    token_endpoint: "",
    nonce_endpoint: "",
    credential_endpoint: "",
    keys: KEYS,
    credential_configurations_supported: {},
    federation_entity: {}
  },
  redirectUri: ""
} satisfies AuthenticationContext;

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
  const actors = createEidIssuanceActorsImplementation({} as Env, store);

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

    const result = await runActor<ReadonlyArray<StatusListEntry>>(
      actors.obtainWuaStatusLists,
      {
        authenticationContext,
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
      "wua-1",
      "wua-1-jwt",
      ITW_VERSION,
      KEYS
    );
    expect(result).toEqual([[WUA_STATUS_LIST_URI, STATUS_LIST_PAYLOAD_2]]);
  });

  it("skips WUA status list verification when WUAs or support are unavailable", async () => {
    mockGetIoWallet.mockReturnValue(createWallet() as never);

    await expect(
      runActor(actors.obtainWuaStatusLists, {
        authenticationContext,
        itwVersion: ITW_VERSION,
        walletUnitAttestations: undefined
      })
    ).resolves.toEqual([]);
    expect(mockGetWuaStatus).not.toHaveBeenCalled();

    mockGetIoWallet.mockReturnValue(createWallet(false) as never);

    await expect(
      runActor(actors.obtainWuaStatusLists, {
        authenticationContext,
        itwVersion: ITW_VERSION,
        walletUnitAttestations: { "wua-1": "wua-1-jwt" }
      })
    ).resolves.toEqual([]);
    expect(mockGetWuaStatus).not.toHaveBeenCalled();
  });

  it("propagates WUA verification failures", async () => {
    const error = new Error("invalid WUA status");
    mockGetIoWallet.mockReturnValue(createWallet() as never);
    mockGetWuaStatus.mockRejectedValue(error);

    await expect(
      runActor(actors.obtainWuaStatusLists, {
        authenticationContext,
        itwVersion: ITW_VERSION,
        walletUnitAttestations: { "wua-1": "wua-1-jwt" }
      })
    ).rejects.toBe(error);
  });

  it("persists status lists before WUAs and the eID", async () => {
    mockUpsertMany.mockResolvedValue();

    const input: StoreEidCredentialActorParams = {
      eid: {
        credential: "eid-jwt",
        metadata: ItwStoredCredentialsMocks.eid
      },
      walletUnitAttestations: { "wua-1": "wua-1-jwt" },
      wuaStatusLists: [[WUA_STATUS_LIST_URI, STATUS_LIST_PAYLOAD]]
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
        credential: "eid-jwt",
        metadata: ItwStoredCredentialsMocks.eid
      },
      walletUnitAttestations: { "wua-1": "wua-1-jwt" },
      wuaStatusLists: [[WUA_STATUS_LIST_URI, STATUS_LIST_PAYLOAD]]
    };

    await expect(runActor(actors.storeEidCredential, input)).rejects.toBe(
      error
    );
    expect(dispatch).not.toHaveBeenCalled();
  });
});
