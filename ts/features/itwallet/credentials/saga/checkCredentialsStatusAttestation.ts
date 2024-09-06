import { select, call, all, put } from "typed-redux-saga/macro";
import { pipe } from "fp-ts/lib/function";
import * as RA from "fp-ts/ReadonlyArray";
import * as O from "fp-ts/Option";
import { itwCredentialsSelector } from "../store/selectors";
import {
  shouldRequestStatusAttestation,
  updateCredentialWithStatusAttestation
} from "../../common/utils/itwCredentialStatusAttestationUtils";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { itwCredentialsStore } from "../store/actions";

/**
 * This saga is responsible to check the status attestation for each credential in the wallet.
 */
export function* checkCredentialsStatusAttestation() {
  const isWalletValid = yield* select(itwLifecycleIsValidSelector);

  // Credentials can be requested only when the wallet is valid, i.e. the eID was issued
  if (!isWalletValid) {
    return;
  }

  const { credentials } = yield* select(itwCredentialsSelector);

  const credentialsToCheck = pipe(
    credentials,
    RA.filterMap(O.filter(x => shouldRequestStatusAttestation(x)))
  );

  if (credentialsToCheck.length === 0) {
    return;
  }

  const updatedCredentials = yield* all(
    credentialsToCheck.map(credential =>
      call(updateCredentialWithStatusAttestation, credential)
    )
  );

  yield* put(itwCredentialsStore(updatedCredentials));
}
