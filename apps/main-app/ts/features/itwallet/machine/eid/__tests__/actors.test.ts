import { CredentialStatus } from "@pagopa/io-react-native-wallet";
import { createStore } from "redux";
import { AnyActorLogic, createActor, toPromise } from "xstate";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { getNetworkError } from "../../../../../utils/errors";
import { getIoWallet } from "../../../common/utils/itwIoWallet";
import { ItwStoredCredentialsMocks } from "../../../common/utils/itwMocksUtils";
import { itwCredentialsReplaceByType } from "../../../credentials/store/actions";
import { itwFetchCredentialsCatalogue } from "../../../credentialsCatalogue/store/actions";
import {
  getCredentialStatusFromStatusList,
  getKeysForStatusListToken
} from "../../../statusList/utils";
import { StatusListRepository } from "../../../statusList/utils/repository";
import {
  itwKeyAttestationsStore,
  itwStoreWalletInstanceStatusList
} from "../../../walletInstance/store/actions";
import { testEidIssuanceDeps, testMachineStore } from "../../utils/testDeps";
import {
  obtainStatusListActor,
  ObtainStatusListActorOutput,
  refreshCredentialsCatalogueActor,
  storeEidCredentialActor,
  StoreEidCredentialActorParams
} from "../actors";

jest.mock("../../../common/utils/itwIoWallet", () => ({
  getIoWallet: jest.fn()
}));

jest.mock("../../../statusList/utils", () => ({
  getCredentialStatusFromStatusList: jest.fn(),
  getKeysForStatusListToken: jest.fn()
}));

jest.mock("../../../statusList/utils/repository", () => ({
  StatusListRepository: {
    upsert: jest.fn()
  }
}));

const mockGetIoWallet = jest.mocked(getIoWallet);
const mockGetCredentialStatus = jest.mocked(getCredentialStatusFromStatusList);
const mockGetKeys = jest.mocked(getKeysForStatusListToken);
const mockUpsert = jest.mocked(StatusListRepository.upsert);

const ITW_VERSION = "1.4.6";
const KA_STATUS_LIST_URI = "https://wallet-provider.example/status-list/1";
const STATUS_LIST_PAYLOAD: CredentialStatus.StatusList = {
  sub: KA_STATUS_LIST_URI,
  iat: 1700000000,
  exp: 1700003600,
  status_list: { bits: 1, lst: "eNrbuRgAAhcBXQ" }
};
const KEYS = [{ kty: "EC" as const, kid: "wallet-provider-key" }];
const EID = {
  credential: "eid-jwt",
  metadata: ItwStoredCredentialsMocks.eid
};

const createWallet = (
  keyAttestationSupported = true,
  statusListSupported = true
) => ({
  KeyAttestation: {
    isSupported: keyAttestationSupported
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
  const store = testMachineStore({
    dispatch,
    getState: jest.fn()
  });
  const deps = testEidIssuanceDeps({ store });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("verifies the first KA status list", async () => {
    mockGetIoWallet.mockReturnValue(createWallet() as never);
    mockGetKeys.mockResolvedValue(KEYS);
    mockGetCredentialStatus.mockResolvedValue({
      idx: 0,
      uri: KA_STATUS_LIST_URI,
      parsedStatusList: STATUS_LIST_PAYLOAD,
      rawStatus: "0x00",
      status: "valid",
      statusList: "status-list-jwt"
    });

    const result = await runActor<ObtainStatusListActorOutput>(
      obtainStatusListActor,
      {
        deps,
        itwVersion: ITW_VERSION,
        keyAttestations: {
          "ka-1": "ka-1-jwt",
          "ka-2": "ka-2-jwt"
        }
      }
    );

    expect(mockGetKeys).toHaveBeenCalledWith(
      "ka-1-jwt",
      deps.env.X509_CERT_ROOT
    );
    expect(mockGetCredentialStatus).toHaveBeenCalledWith(
      ITW_VERSION,
      "ka-1-jwt",
      "ka-1",
      "dc+sd-jwt",
      KEYS
    );
    expect(result).toEqual({
      idx: 0,
      uri: KA_STATUS_LIST_URI,
      parsedStatusList: STATUS_LIST_PAYLOAD,
      rawStatus: "0x00",
      status: "valid",
      statusList: "status-list-jwt"
    });
  });

  it("fails when PID KA is missing on supported versions", async () => {
    mockGetIoWallet.mockReturnValue(createWallet() as never);

    await expect(
      runActor(obtainStatusListActor, {
        deps,
        itwVersion: ITW_VERSION,
        keyAttestations: undefined
      })
    ).rejects.toThrow("PID Key Attestations are not defined or empty");
  });

  it("skips KA status list verification when support is unavailable", async () => {
    mockGetIoWallet.mockReturnValue(createWallet(false) as never);

    await expect(
      runActor(obtainStatusListActor, {
        deps,
        itwVersion: ITW_VERSION,
        keyAttestations: undefined
      })
    ).resolves.toBeUndefined();
    expect(mockGetCredentialStatus).not.toHaveBeenCalled();
  });

  it("propagates KA verification failures", async () => {
    const error = new Error("invalid KA status");
    mockGetIoWallet.mockReturnValue(createWallet() as never);
    mockGetKeys.mockResolvedValue(KEYS);
    mockGetCredentialStatus.mockRejectedValue(error);

    await expect(
      runActor(obtainStatusListActor, {
        deps,
        itwVersion: ITW_VERSION,
        keyAttestations: { "ka-1": "ka-1-jwt" }
      })
    ).rejects.toBe(error);
  });

  it("persists status lists before KAs and the eID", async () => {
    mockUpsert.mockResolvedValue();

    const input: StoreEidCredentialActorParams = {
      eid: {
        ...EID
      },
      keyAttestations: { "ka-1": "ka-1-jwt" },
      walletInstanceStatusList: {
        idx: 0,
        parsedStatusList: STATUS_LIST_PAYLOAD,
        uri: KA_STATUS_LIST_URI
      },
      deps: testEidIssuanceDeps({ store })
    };

    await expect(runActor(storeEidCredentialActor, input)).resolves.toBe(
      undefined
    );

    expect(mockUpsert).toHaveBeenCalledWith(
      KA_STATUS_LIST_URI,
      STATUS_LIST_PAYLOAD
    );
    expect(dispatch.mock.calls.map(([action]) => action.type)).toEqual([
      itwStoreWalletInstanceStatusList.toString(),
      itwKeyAttestationsStore.toString(),
      itwCredentialsReplaceByType.toString()
    ]);
  });

  it("does not store KAs or the eID when status list persistence fails", async () => {
    const error = new Error("status list persistence failed");
    mockUpsert.mockRejectedValue(error);

    const input: StoreEidCredentialActorParams = {
      eid: {
        ...EID
      },
      keyAttestations: { "ka-1": "ka-1-jwt" },
      walletInstanceStatusList: {
        idx: 0,
        parsedStatusList: STATUS_LIST_PAYLOAD,
        uri: KA_STATUS_LIST_URI
      },
      deps: testEidIssuanceDeps({ store })
    };

    await expect(runActor(storeEidCredentialActor, input)).rejects.toBe(error);
    expect(dispatch).not.toHaveBeenCalled();
  });
});

describe("refreshCredentialsCatalogueActor", () => {
  const catalogue = {
    taxonomy_uri: "",
    exp: 1700000000,
    iat: 1600000000,
    credentials: []
  };

  test.each([
    { name: "successful fetch", fails: false, cached: false },
    { name: "failed fetch", fails: true, cached: false },
    { name: "failed refresh with cached catalogue", fails: true, cached: true }
  ])("settles correctly after $name", async ({ fails, cached }) => {
    const store = createStore(appReducer);
    store.dispatch(applicationChangeState("active"));
    if (cached) {
      store.dispatch(itwFetchCredentialsCatalogue.success(catalogue));
    }
    const actor = createActor(refreshCredentialsCatalogueActor, {
      input: { deps: testEidIssuanceDeps({ store }) }
    });
    const result = toPromise(actor);
    actor.start();
    store.dispatch(applicationChangeState("active"));
    expect(actor.getSnapshot().status).toBe("active");

    if (fails) {
      const error = new Error("Catalogue unavailable");
      store.dispatch(
        itwFetchCredentialsCatalogue.failure(getNetworkError(error))
      );
      await expect(result).rejects.toBe(error);
    } else {
      store.dispatch(itwFetchCredentialsCatalogue.success(catalogue));
      await expect(result).resolves.toBeUndefined();
    }
  });

  it("unsubscribes when stopped while the refresh is pending", () => {
    const store = createStore(appReducer);
    store.dispatch(applicationChangeState("active"));
    const subscribe = store.subscribe.bind(store);
    const unsubscribe = jest.fn();
    const listener = jest.fn();
    jest.spyOn(store, "subscribe").mockImplementation(callback => {
      listener.mockImplementation(callback);
      unsubscribe.mockImplementation(subscribe(listener));
      return unsubscribe;
    });
    const actor = createActor(refreshCredentialsCatalogueActor, {
      input: { deps: testEidIssuanceDeps({ store }) }
    });
    actor.start();
    expect(unsubscribe).not.toHaveBeenCalled();

    actor.stop();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    listener.mockClear();
    store.dispatch(itwFetchCredentialsCatalogue.success(catalogue));
    expect(listener).not.toHaveBeenCalled();
  });

  it("unsubscribes when dispatch throws", async () => {
    const error = new Error("Dispatch failed");
    const unsubscribe = jest.fn();
    const store = testMachineStore({
      subscribe: () => unsubscribe,
      dispatch: () => {
        throw error;
      }
    });
    const input = { deps: testEidIssuanceDeps({ store }) };

    await expect(
      runActor(refreshCredentialsCatalogueActor, input)
    ).rejects.toBe(error);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
