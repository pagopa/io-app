import * as O from "fp-ts/lib/Option";
import { type DeepPartial } from "redux";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { sessionTokenSelector } from "../../../../authentication/store/selectors";
import { GlobalState } from "../../../../../store/reducers/types";
import { getWalletInstanceStatus } from "../../../common/utils/itwAttestationUtils";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";
import { itwIntegrityServiceStatusSelector } from "../../../issuance/store/selectors";
import { itwIsWalletInstanceAttestationValidSelector } from "../../../walletInstance/store/selectors";
import { ItwLifecycleState } from "../../store/reducers";
import { checkIntegrityServiceReadySaga } from "../checkIntegrityServiceReadySaga";
import {
  checkWalletInstanceStateSaga,
  getStatusOrResetWalletInstance
} from "../checkWalletInstanceStateSaga";
import { handleWalletInstanceResetSaga } from "../handleWalletInstanceResetSaga";

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
      .provide([[matchers.call.fn(checkIntegrityServiceReadySaga), true]])
      .call.fn(checkIntegrityServiceReadySaga)
      .not.call.fn(getStatusOrResetWalletInstance)
      .run();
  });

  it("Checks the wallet state when the wallet is OPERATIONAL", () => {
    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          lifecycle: ItwLifecycleState.ITW_LIFECYCLE_OPERATIONAL,
          issuance: {
            integrityServiceStatus: "ready",
            integrityKeyTag: O.some("aac6e82a-e27e-4293-9b55-94a9fab22763")
          },
          credentials: { eid: O.none, credentials: [] }
        }
      }
    };

    return expectSaga(checkWalletInstanceStateSaga)
      .withState(store)
      .provide([
        [matchers.select(sessionTokenSelector), "h94LhbfJCLGH1S3qHj"],
        [matchers.select(itwIsWalletInstanceAttestationValidSelector), false],
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
        [matchers.select(sessionTokenSelector), "h94LhbfJCLGH1S3qHj"],
        [matchers.select(itwIsWalletInstanceAttestationValidSelector), false],
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
        [matchers.select(sessionTokenSelector), "h94LhbfJCLGH1S3qHj"],
        [matchers.select(itwIsWalletInstanceAttestationValidSelector), false],
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
        [matchers.select(sessionTokenSelector), "h94LhbfJCLGH1S3qHj"],
        [matchers.select(itwIsWalletInstanceAttestationValidSelector), false],
        [matchers.call.fn(getWalletInstanceStatus), { is_revoked: true }],
        [matchers.call.fn(checkIntegrityServiceReadySaga), true]
      ])
      .call.fn(checkIntegrityServiceReadySaga)
      .call.fn(getStatusOrResetWalletInstance)
      .call.fn(handleWalletInstanceResetSaga)
      .run();
  });
});
