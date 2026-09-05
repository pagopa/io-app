import { Errors } from "@pagopa/io-react-native-wallet";
import * as O from "fp-ts/lib/Option";
import { type DeepPartial } from "redux";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { throwError } from "redux-saga-test-plan/providers";

import { GlobalState } from "../../../../../store/reducers/types";
import { sessionTokenSelector } from "../../../../authentication/common/store/selectors";
import { selectItwSpecsVersion } from "../../../common/store/selectors/environment";
import { getWalletInstanceStatus } from "../../../common/utils/itwAttestationUtils";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";
import { itwIntegrityServiceStatusSelector } from "../../../issuance/store/selectors";
import { StatusListRepository } from "../../../statusList/utils/repository";
import { itwUpdateWalletInstanceStatus } from "../../../walletInstance/store/actions";
import { checkIntegrityServiceReadySaga } from "../checkIntegrityServiceReadySaga";
import {
  checkWalletInstanceInconsistencySaga,
  checkWalletInstanceStateOfflineSaga,
  checkWalletInstanceStateSaga,
  getStatusListStatusOrResetWalletInstance,
  getStatusOrResetWalletInstance
} from "../checkWalletInstanceStateSaga";
import { handleWalletInstanceResetSaga } from "../handleWalletInstanceResetSaga";

jest.mock("@pagopa/io-react-native-crypto", () => ({
  deleteKey: jest.fn
}));

const mockGetStatus = jest.fn();
const mockPid = {
  credentialType: "pid",
  credentialId: "dc_sd_jwt_PersonIdentificationData",
  format: "dc+sd-jwt"
} as CredentialMetadata;

jest.mock("../../../common/utils/itwIoWallet", () => ({
  getIoWallet: jest.fn((version: string) => ({
    CredentialStatus: {
      statusList: {
        isSupported: version === "1.3.3",
        getStatus: mockGetStatus
      }
    }
  }))
}));

describe("checkWalletInstanceStateSaga", () => {
  // TODO: improve the mocked store's typing, do not use DeepPartial
  it("Does not check the wallet state when the wallet is INSTALLED", () => {
    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          issuance: { integrityKeyTag: O.none },
          preferences: {},
          walletInstance: { statusList: undefined },
          credentials: { credentials: {} }
        }
      }
    };
    return expectSaga(checkWalletInstanceStateSaga)
      .withState(store)
      .provide([[matchers.call.fn(checkIntegrityServiceReadySaga), true]])
      .not.call.fn(checkIntegrityServiceReadySaga)
      .not.call.fn(getStatusOrResetWalletInstance)
      .run();
  });

  it("Checks the wallet state when the wallet is OPERATIONAL", () => {
    const store: DeepPartial<GlobalState> = {
      remoteConfig: O.none,
      features: {
        itWallet: {
          issuance: {
            integrityServiceStatus: "ready",
            integrityKeyTag: O.some("aac6e82a-e27e-4293-9b55-94a9fab22763")
          },
          credentials: { credentials: {} },
          environment: {
            env: "prod"
          },
          preferences: {},
          walletInstance: { statusList: undefined }
        }
      }
    };

    return expectSaga(checkWalletInstanceStateSaga)
      .withState(store)
      .provide([
        [matchers.select(sessionTokenSelector), "h94LhbfJCLGH1S3qHj"],
        [matchers.select(itwIntegrityServiceStatusSelector), "ready"],
        [matchers.call.fn(getWalletInstanceStatus), { is_revoked: false }],
        [matchers.call.fn(checkIntegrityServiceReadySaga), true]
      ])
      .call.fn(checkIntegrityServiceReadySaga)
      .call.fn(getStatusOrResetWalletInstance)
      .not.call.fn(handleWalletInstanceResetSaga)
      .run();
  });

  it("Checks and resets the wallet state when the wallet is OPERATIONAL and the instance was revoked", () => {
    const store: DeepPartial<GlobalState> = {
      remoteConfig: O.none,
      features: {
        itWallet: {
          issuance: {
            integrityKeyTag: O.some("aac6e82a-e27e-4293-9b55-94a9fab22763")
          },
          credentials: { credentials: {} },
          environment: {
            env: "prod"
          },
          preferences: {},
          walletInstance: { statusList: undefined }
        }
      }
    };

    return expectSaga(checkWalletInstanceStateSaga)
      .withState(store)
      .provide([
        [matchers.select(sessionTokenSelector), "h94LhbfJCLGH1S3qHj"],
        [matchers.call.fn(getWalletInstanceStatus), { is_revoked: true }],
        [matchers.call.fn(checkIntegrityServiceReadySaga), true]
      ])
      .call.fn(checkIntegrityServiceReadySaga)
      .call.fn(getStatusOrResetWalletInstance)
      .call.fn(handleWalletInstanceResetSaga)
      .run();
  });

  it("Checks the wallet state when the wallet is VALID", () => {
    const store: DeepPartial<GlobalState> = {
      remoteConfig: O.none,
      features: {
        itWallet: {
          issuance: {
            integrityKeyTag: O.some("3396d31e-ac6a-4357-8083-cb5d3cda4d74")
          },
          credentials: {
            credentials: { [mockPid.credentialId]: mockPid }
          },
          environment: {
            env: "prod"
          },
          preferences: {},
          walletInstance: { statusList: undefined }
        }
      }
    };

    return expectSaga(checkWalletInstanceStateSaga)
      .withState(store)
      .provide([
        [matchers.select(sessionTokenSelector), "h94LhbfJCLGH1S3qHj"],
        [matchers.call.fn(getWalletInstanceStatus), { is_revoked: false }],
        [matchers.call.fn(checkIntegrityServiceReadySaga), true]
      ])
      .call.fn(checkIntegrityServiceReadySaga)
      .call.fn(getStatusOrResetWalletInstance)
      .not.call.fn(handleWalletInstanceResetSaga)
      .run();
  });

  it("Checks and resets the wallet state when the wallet is VALID and the instance was revoked", () => {
    const store: DeepPartial<GlobalState> = {
      remoteConfig: O.none,
      features: {
        itWallet: {
          issuance: {
            integrityKeyTag: O.some("3396d31e-ac6a-4357-8083-cb5d3cda4d74")
          },
          credentials: {
            credentials: { [mockPid.credentialId]: mockPid }
          },
          environment: {
            env: "prod"
          },
          preferences: {},
          walletInstance: { statusList: undefined }
        }
      }
    };

    return expectSaga(checkWalletInstanceStateSaga)
      .withState(store)
      .provide([
        [matchers.select(sessionTokenSelector), "h94LhbfJCLGH1S3qHj"],
        [matchers.call.fn(getWalletInstanceStatus), { is_revoked: true }],
        [matchers.call.fn(checkIntegrityServiceReadySaga), true]
      ])
      .call.fn(checkIntegrityServiceReadySaga)
      .call.fn(getStatusOrResetWalletInstance)
      .call.fn(handleWalletInstanceResetSaga)
      .run();
  });

  it("Resets the wallet instance when EID is present but integrity key tag is missing", () => {
    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          issuance: { integrityKeyTag: O.none },
          credentials: {
            credentials: { [mockPid.credentialId]: mockPid }
          },
          preferences: {},
          walletInstance: { statusList: undefined }
        }
      }
    };

    return expectSaga(checkWalletInstanceInconsistencySaga)
      .withState(store)
      .call.fn(handleWalletInstanceResetSaga)
      .not.call.fn(checkIntegrityServiceReadySaga)
      .not.call.fn(checkWalletInstanceStateSaga)
      .run();
  });

  it("Resets the wallet instance when the status endpoint returns 404 with a valid key tag", () => {
    const store: DeepPartial<GlobalState> = {
      remoteConfig: O.none,
      features: {
        itWallet: {
          issuance: {
            integrityKeyTag: O.some("aac6e82a-e27e-4293-9b55-94a9fab22763")
          },
          credentials: { credentials: {} },
          environment: { env: "prod" },
          preferences: {},
          walletInstance: { statusList: undefined }
        }
      }
    };

    return expectSaga(checkWalletInstanceStateSaga)
      .withState(store)
      .provide([
        [matchers.select(sessionTokenSelector), "h94LhbfJCLGH1S3qHj"],
        [matchers.call.fn(checkIntegrityServiceReadySaga), true],
        [
          matchers.call.fn(getWalletInstanceStatus),
          throwError(
            new Errors.WalletProviderResponseError({
              message: "Not Found",
              reason: {
                detail: "Wallet instance not found",
                status: 404,
                title: "Not Found"
              },
              statusCode: 404
            })
          )
        ]
      ])
      .call.fn(handleWalletInstanceResetSaga)
      .put(itwUpdateWalletInstanceStatus.cancel())
      .not.put.like({
        action: { type: itwUpdateWalletInstanceStatus.failure.toString() }
      })
      .run();
  });
});

describe("checkWalletInstanceStateOfflineSaga - Status List [1.3.3+]", () => {
  const integrityKeyTag = "3396d31e-ac6a-4357-8083-cb5d3cda4d74";
  const statusListEntry = {
    idx: 4,
    uri: "https://wallet-provider.example/status/1"
  };
  const statusListToken = {
    sub: statusListEntry.uri,
    iat: 1690000000,
    exp: Date.now() / 1000 + 3600,
    status_list: { bits: 2, lst: "eNrbuRgAAhcBXQ" }
  };

  const getStore = (
    statusList: undefined | { idx: number; uri: string }
  ): DeepPartial<GlobalState> => ({
    remoteConfig: O.none,
    features: {
      itWallet: {
        issuance: { integrityKeyTag: O.some(integrityKeyTag) },
        credentials: {
          credentials: { [mockPid.credentialId]: mockPid }
        },
        environment: { env: "prod" },
        preferences: {},
        walletInstance: { statusList }
      }
    }
  });

  beforeEach(() => {
    mockGetStatus.mockReset();
  });

  it.each([
    { name: "valid", status: "VALID", isRevoked: false },
    { name: "revoked", status: "REVOKED", isRevoked: true },
    { name: "suspended", status: "SUSPENDED", isRevoked: true },
    { name: "unsupported", status: "SOMETHING_ELSE", isRevoked: true }
  ])(
    "Resets the wallet unless the status is valid, with status $name",
    ({ status, isRevoked }) => {
      mockGetStatus.mockReturnValue({ status, rawStatus: "0x01" });

      const saga = expectSaga(checkWalletInstanceStateOfflineSaga)
        .withState(getStore(statusListEntry))
        .provide([
          [matchers.select(selectItwSpecsVersion), "1.3.3"],
          [matchers.call.fn(StatusListRepository.get), statusListToken]
        ])
        .not.call.fn(getWalletInstanceStatus)
        .not.call.fn(checkIntegrityServiceReadySaga)
        .put(
          itwUpdateWalletInstanceStatus.success({
            id: integrityKeyTag,
            is_revoked: isRevoked,
            ...(isRevoked && {
              revocation_reason: "CERTIFICATE_REVOKED_BY_ISSUER" as const
            })
          })
        );

      return (
        isRevoked
          ? saga.call.fn(handleWalletInstanceResetSaga)
          : saga.not.call.fn(handleWalletInstanceResetSaga)
      ).run();
    }
  );

  it.each([
    { name: "missing", cached: undefined },
    {
      name: "stale",
      cached: { ...statusListToken, exp: Date.now() / 1000 - 1 }
    }
  ])(
    "Silently skips the check when the cached status list is $name",
    ({ cached }) =>
      expectSaga(checkWalletInstanceStateOfflineSaga)
        .withState(getStore(statusListEntry))
        .provide([
          [matchers.select(selectItwSpecsVersion), "1.3.3"],
          [matchers.call.fn(StatusListRepository.get), cached]
        ])
        .not.call.fn(handleWalletInstanceResetSaga)
        .not.put.actionType(itwUpdateWalletInstanceStatus.success.toString())
        .not.put.actionType(itwUpdateWalletInstanceStatus.failure.toString())
        .run()
  );

  it.each([
    {
      name: "the wallet instance has no status list entry",
      itwVersion: "1.3.3",
      statusList: undefined
    },
    {
      name: "the status list is not supported by the specs version",
      itwVersion: "1.0.0",
      statusList: statusListEntry
    }
  ])("Skips the offline check when $name", ({ itwVersion, statusList }) =>
    expectSaga(checkWalletInstanceStateOfflineSaga)
      .withState(getStore(statusList))
      .provide([[matchers.select(selectItwSpecsVersion), itwVersion]])
      .not.call.fn(getStatusListStatusOrResetWalletInstance)
      .not.call.fn(getStatusOrResetWalletInstance)
      .not.call.fn(handleWalletInstanceResetSaga)
      .run()
  );

  it("Uses the backend status endpoint when online", () =>
    expectSaga(checkWalletInstanceStateSaga)
      .withState(getStore(statusListEntry))
      .provide([
        [matchers.select(sessionTokenSelector), "h94LhbfJCLGH1S3qHj"],
        [matchers.call.fn(checkIntegrityServiceReadySaga), true],
        [
          matchers.call.fn(getWalletInstanceStatus),
          { id: integrityKeyTag, is_revoked: false }
        ]
      ])
      .call.fn(getStatusOrResetWalletInstance)
      .not.call.fn(getStatusListStatusOrResetWalletInstance)
      .run());
});
