import { type DeepPartial } from "redux";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { throwError } from "redux-saga-test-plan/providers";
import { Errors } from "@pagopa/io-react-native-wallet";
import { deleteKey } from "@pagopa/io-react-native-crypto";
import * as O from "fp-ts/lib/Option";
import { checkWalletInstanceStateSaga } from "../checkWalletInstanceStateSaga";
import { ItwLifecycleState } from "../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { itwRemoveIntegrityKeyTag } from "../../../issuance/store/actions";
import { itwLifecycleStateUpdated } from "../../store/actions";
import { getAttestation } from "../../../common/utils/itwAttestationUtils";

jest.mock("@pagopa/io-react-native-crypto", () => ({
  deleteKey: jest.fn
}));

describe("checkWalletInstanceStateSaga", () => {
  it("Does not check the wallet state if the wallet is INSTALLED", () => {
    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          lifecycle: ItwLifecycleState.ITW_LIFECYCLE_INSTALLED,
          issuance: { integrityKeyTag: O.none }
        }
      }
    };
    return expectSaga(checkWalletInstanceStateSaga)
      .withState(store)
      .not.call.fn(getAttestation)
      .run();
  });

  it("Checks the wallet state if the wallet is OPERATIONAL and the attestation is valid", () => {
    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          lifecycle: ItwLifecycleState.ITW_LIFECYCLE_OPERATIONAL,
          issuance: {
            integrityKeyTag: O.some("aac6e82a-e27e-4293-9b55-94a9fab22763")
          }
        }
      }
    };

    return expectSaga(checkWalletInstanceStateSaga)
      .withState(store)
      .provide([
        [
          matchers.call.fn(getAttestation),
          "aac6e82a-e27e-4293-9b55-94a9fab22763"
        ]
      ])
      .call.fn(getAttestation)
      .not.put(itwRemoveIntegrityKeyTag())
      .run();
  });

  it("Checks the wallet state if the wallet is OPERATIONAL and the attestation is not valid", () => {
    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          lifecycle: ItwLifecycleState.ITW_LIFECYCLE_OPERATIONAL,
          issuance: {
            integrityKeyTag: O.some("aac6e82a-e27e-4293-9b55-94a9fab22763")
          }
        }
      }
    };

    return expectSaga(checkWalletInstanceStateSaga)
      .withState(store)
      .provide([
        [
          matchers.call.fn(getAttestation),
          throwError(
            new Errors.WalletInstanceRevokedError("Revoked", "Revoked")
          )
        ]
      ])
      .call.fn(getAttestation)
      .call.fn(deleteKey)
      .put(itwRemoveIntegrityKeyTag())
      .put(itwLifecycleStateUpdated(ItwLifecycleState.ITW_LIFECYCLE_INSTALLED))
      .run();
  });
});
