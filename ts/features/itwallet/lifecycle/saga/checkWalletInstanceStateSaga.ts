import { Errors } from "@pagopa/io-react-native-wallet";
import { call, put, select } from "typed-redux-saga/macro";
import * as O from "fp-ts/lib/Option";
import { itwLifecycleSelector } from "../store/selectors";
import { getAttestation } from "../../common/utils/itwAttestationUtils";
import { itwHardwareKeyTagSelector } from "../../issuance/store/selectors";
import { ReduxSagaEffect } from "../../../../types/utils";
import { ItwLifecycleState } from "../store/reducers";
import { itwLifecycleDeactivated } from "../store/actions";

/**
 * The wallet instance's state check is performed
 * only when the instance is in one the following states.
 */
const activeStates = [
  ItwLifecycleState.ITW_LIFECYCLE_OPERATIONAL,
  ItwLifecycleState.ITW_LIFECYCLE_VALID
];

function* handleWalletInstanceReset() {
  // TODO: reset wallet instance store and keys
  yield* put(itwLifecycleDeactivated()); // or installed?
}

export function* checkWalletInstanceStateSaga(): Generator<
  ReduxSagaEffect,
  void
> {
  const walletInstanceState = yield* select(itwLifecycleSelector);

  if (!activeStates.includes(walletInstanceState)) {
    return;
  }

  const hardwareKeyTag = yield* select(itwHardwareKeyTagSelector);

  if (O.isNone(hardwareKeyTag)) {
    throw new Error(
      "[IT Wallet] Missing hardware key tag but the instance is operational/valid"
    );
  }

  try {
    /**
     * Get a wallet attestation to check whether
     * the wallet instance was revoked or does not exist at all.
     */
    yield* call(getAttestation, hardwareKeyTag.value);
  } catch (err) {
    if (
      err instanceof Errors.WalletInstanceAttestationIssuingError // TODO: use the commented errors when io-react-native-wallet will export them
      // err instanceof Errors.WalletInstanceRevokedError ||
      // err instanceof Errors.WalletInstanceNotFoundError
    ) {
      yield* call(handleWalletInstanceReset);
    }
  }
}
