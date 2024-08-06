import { type DeepPartial } from "redux";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { throwError } from "redux-saga-test-plan/providers";
import { Errors } from "@pagopa/io-react-native-wallet";
import * as O from "fp-ts/lib/Option";
import {
  checkWalletInstanceStateSaga,
  getAttestationOrResetWalletInstance
} from "../checkWalletInstanceStateSaga";
import { ItwLifecycleState } from "../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { getAttestation } from "../../../common/utils/itwAttestationUtils";
import { ensureIntegrityServiceIsReady } from "../../../common/utils/itwIntegrityUtils";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";
import { sessionTokenSelector } from "../../../../../store/reducers/authentication";
import { handleWalletInstanceReset } from "../handleWalletInstanceResetSaga";

jest.mock("@pagopa/io-react-native-crypto", () => ({
  deleteKey: jest.fn
}));

describe("checkWalletInstanceStateSaga", () => {
  // TODO: improve the mocked store's typing, do not use DeepPartial
  it("Does not check the wallet state when the wallet is INSTALLED", () => {
    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          lifecycle: ItwLifecycleState.ITW_LIFECYCLE_INSTALLED,
          issuance: { integrityKeyTag: O.none },
          credentials: { eid: O.none, credentials: [] }
        }
      }
    };
    return expectSaga(checkWalletInstanceStateSaga)
      .withState(store)
      .not.call.fn(getAttestationOrResetWalletInstance)
      .run();
  });

  it("Checks the wallet state when the wallet is OPERATIONAL and the attestation is valid", () => {
    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          lifecycle: ItwLifecycleState.ITW_LIFECYCLE_OPERATIONAL,
          issuance: {
            integrityKeyTag: O.some("aac6e82a-e27e-4293-9b55-94a9fab22763")
          },
          credentials: { eid: O.none, credentials: [] }
        }
      }
    };

    return expectSaga(checkWalletInstanceStateSaga)
      .withState(store)
      .provide([
        [matchers.call.fn(ensureIntegrityServiceIsReady), true],
        [matchers.select(sessionTokenSelector), "h94LhbfJCLGH1S3qHj"],
        [
          matchers.call.fn(getAttestation),
          "aac6e82a-e27e-4293-9b55-94a9fab22763"
        ]
      ])
      .call.fn(getAttestationOrResetWalletInstance)
      .not.call.fn(handleWalletInstanceReset)
      .run();
  });

  it("Checks and resets the wallet state when the wallet is OPERATIONAL and the attestation is not valid", () => {
    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          lifecycle: ItwLifecycleState.ITW_LIFECYCLE_OPERATIONAL,
          issuance: {
            integrityKeyTag: O.some("aac6e82a-e27e-4293-9b55-94a9fab22763")
          },
          credentials: { eid: O.none, credentials: [] }
        }
      }
    };

    return expectSaga(checkWalletInstanceStateSaga)
      .withState(store)
      .provide([
        [matchers.call.fn(ensureIntegrityServiceIsReady), true],
        [matchers.select(sessionTokenSelector), "h94LhbfJCLGH1S3qHj"],
        [
          matchers.call.fn(getAttestation),
          throwError(
            new Errors.WalletInstanceRevokedError("Revoked", "Revoked")
          )
        ]
      ])
      .call.fn(getAttestationOrResetWalletInstance)
      .call.fn(handleWalletInstanceReset)
      .run();
  });

  it("Checks the wallet state when the wallet is VALID and the attestation is valid", () => {
    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          lifecycle: ItwLifecycleState.ITW_LIFECYCLE_VALID,
          issuance: {
            integrityKeyTag: O.some("3396d31e-ac6a-4357-8083-cb5d3cda4d74")
          },
          credentials: { eid: O.some({} as StoredCredential), credentials: [] }
        }
      }
    };

    return expectSaga(checkWalletInstanceStateSaga)
      .withState(store)
      .provide([
        [matchers.call.fn(ensureIntegrityServiceIsReady), true],
        [matchers.select(sessionTokenSelector), "h94LhbfJCLGH1S3qHj"],
        [
          matchers.call.fn(getAttestation),
          "3396d31e-ac6a-4357-8083-cb5d3cda4d74"
        ]
      ])
      .call.fn(getAttestationOrResetWalletInstance)
      .not.call.fn(handleWalletInstanceReset)
      .run();
  });

  it("Checks and resets the wallet state when the wallet is VALID and the attestation is not valid", () => {
    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          lifecycle: ItwLifecycleState.ITW_LIFECYCLE_VALID,
          issuance: {
            integrityKeyTag: O.some("3396d31e-ac6a-4357-8083-cb5d3cda4d74")
          },
          credentials: { eid: O.some({} as StoredCredential), credentials: [] }
        }
      }
    };

    return expectSaga(checkWalletInstanceStateSaga)
      .withState(store)
      .provide([
        [matchers.call.fn(ensureIntegrityServiceIsReady), true],
        [matchers.select(sessionTokenSelector), "h94LhbfJCLGH1S3qHj"],
        [
          matchers.call.fn(getAttestation),
          throwError(
            new Errors.WalletInstanceRevokedError("Revoked", "Revoked")
          )
        ]
      ])
      .call.fn(getAttestationOrResetWalletInstance)
      .call.fn(handleWalletInstanceReset)
      .run();
  });
});
