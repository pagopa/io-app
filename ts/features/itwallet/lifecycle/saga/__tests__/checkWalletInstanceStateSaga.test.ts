import * as O from "fp-ts/lib/Option";
import { type DeepPartial } from "redux";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { sessionTokenSelector } from "../../../../authentication/common/store/selectors";
import { GlobalState } from "../../../../../store/reducers/types";
import { getWalletInstanceStatus } from "../../../common/utils/itwAttestationUtils";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";
import { itwIntegrityServiceStatusSelector } from "../../../issuance/store/selectors";

import { checkIntegrityServiceReadySaga } from "../checkIntegrityServiceReadySaga";
import {
  checkWalletInstanceInconsistencySaga,
  checkWalletInstanceStateSaga,
  getStatusOrResetWalletInstance
} from "../checkWalletInstanceStateSaga";
import { handleWalletInstanceResetSaga } from "../handleWalletInstanceResetSaga";

jest.mock("@pagopa/io-react-native-crypto", () => ({
  deleteKey: jest.fn
}));

describe("checkWalletInstanceStateSaga", () => {
  const mockPid = {
    credentialType: "PersonIdentificationData",
    credentialId: "dc_sd_jwt_PersonIdentificationData",
    format: "dc+sd-jwt"
  } as StoredCredential;
  // TODO: improve the mocked store's typing, do not use DeepPartial
  it("Does not check the wallet state when the wallet is INSTALLED", () => {
    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          issuance: { integrityKeyTag: O.none },
          credentials: { credentials: {} }
        }
      }
    };
    return expectSaga(checkWalletInstanceStateSaga)
      .withState(store)
      .provide([[matchers.call.fn(checkIntegrityServiceReadySaga), true]])
      .call.fn(checkIntegrityServiceReadySaga)
      .not.call.fn(getStatusOrResetWalletInstance)
      .run();
  });

  it("Checks the wallet state when the wallet is OPERATIONAL", () => {
    const store: DeepPartial<GlobalState> = {
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
          preferences: {}
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
      features: {
        itWallet: {
          issuance: {
            integrityKeyTag: O.some("aac6e82a-e27e-4293-9b55-94a9fab22763")
          },
          credentials: { credentials: {} },
          environment: {
            env: "prod"
          },
          preferences: {}
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
          preferences: {}
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
          preferences: {}
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
          }
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
});
