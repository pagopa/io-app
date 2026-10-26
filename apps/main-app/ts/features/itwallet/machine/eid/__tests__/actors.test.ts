import { CredentialStatus } from "@pagopa/io-react-native-wallet";
import { AnyActorLogic, createActor } from "xstate";

import { getIoWallet } from "../../../common/utils/itwIoWallet";
import { ItwStoredCredentialsMocks } from "../../../common/utils/itwMocksUtils";
import { CredentialBundle } from "../../../common/utils/itwTypesUtils";
import { itwCredentialsReplaceByType } from "../../../credentials/store/actions";
import {
  getCredentialStatusFromStatusList,
  getKeysForStatusListToken
} from "../../../statusList/utils";
import { InvalidTslCredentialStatus } from "../../../statusList/utils/errors";
import { StatusListRepository } from "../../../statusList/utils/repository";
import {
  itwKeyAttestationsStore,
  itwStoreWalletInstanceStatusList
} from "../../../walletInstance/store/actions";
import { testEidIssuanceDeps, testMachineStore } from "../../utils/testDeps";
import {
  obtainEidStatusListActor,
  obtainStatusListActor,
  ObtainStatusListActorOutput,
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

  describe("obtainEidStatusListActor", () => {
    const PID_STATUS_LIST_URI = "https://pid-provider.example/status-list/1";
    const PID_STATUS_LIST_PAYLOAD: CredentialStatus.StatusList = {
      ...STATUS_LIST_PAYLOAD,
      sub: PID_STATUS_LIST_URI
    };
    const PID_ISSUER_KEYS = [{ kty: "EC" as const, kid: "pid-provider-key" }];
    const PID: CredentialBundle = {
      credential: "eid-jwt",
      metadata: {
        ...ItwStoredCredentialsMocks.eid,
        credentialId: "dc_sd_jwt_PersonIdentificationData",
        format: "dc+sd-jwt",
        issuerConf: {
          ...ItwStoredCredentialsMocks.eid.issuerConf,
          keys: PID_ISSUER_KEYS
        }
      }
    };

    it("attaches the PID status list verified with the PID Provider keys", async () => {
      mockGetIoWallet.mockReturnValue(createWallet() as never);
      mockGetCredentialStatus.mockResolvedValue({
        idx: 42,
        uri: PID_STATUS_LIST_URI,
        parsedStatusList: PID_STATUS_LIST_PAYLOAD,
        rawStatus: "0x00",
        status: "valid",
        statusList: "pid-status-list-jwt"
      });

      const result = await runActor<CredentialBundle>(
        obtainEidStatusListActor,
        { itwVersion: ITW_VERSION, eid: PID }
      );

      expect(mockGetCredentialStatus).toHaveBeenCalledWith(
        ITW_VERSION,
        "eid-jwt",
        "dc_sd_jwt_PersonIdentificationData",
        "dc+sd-jwt",
        PID_ISSUER_KEYS
      );
      expect(result).toEqual({
        credential: "eid-jwt",
        metadata: {
          ...PID.metadata,
          validity: {
            type: "status_list",
            status: "valid",
            rawStatus: "0x00",
            statusList: { uri: PID_STATUS_LIST_URI, idx: 42 }
          }
        },
        statusList: {
          uri: PID_STATUS_LIST_URI,
          payload: PID_STATUS_LIST_PAYLOAD
        }
      });
    });

    it("returns the eID untouched when the Status List is not supported", async () => {
      mockGetIoWallet.mockReturnValue(createWallet(true, false) as never);

      await expect(
        runActor(obtainEidStatusListActor, {
          itwVersion: "1.0.0",
          eid: PID
        })
      ).resolves.toBe(PID);
      expect(mockGetCredentialStatus).not.toHaveBeenCalled();
    });

    it("fails when the eID is missing", async () => {
      mockGetIoWallet.mockReturnValue(createWallet() as never);

      await expect(
        runActor(obtainEidStatusListActor, {
          itwVersion: ITW_VERSION,
          eid: undefined
        })
      ).rejects.toThrow("eID credential is undefined");
    });

    it("propagates a non valid PID status", async () => {
      const error = new InvalidTslCredentialStatus(
        PID.metadata.credentialId,
        "0x01"
      );
      mockGetIoWallet.mockReturnValue(createWallet() as never);
      mockGetCredentialStatus.mockRejectedValue(error);

      await expect(
        runActor(obtainEidStatusListActor, {
          itwVersion: ITW_VERSION,
          eid: PID
        })
      ).rejects.toBe(error);
    });
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
