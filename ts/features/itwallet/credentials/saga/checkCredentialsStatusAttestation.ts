import { select, call, all, put } from "typed-redux-saga/macro";
import { pipe } from "fp-ts/lib/function";
import * as RA from "fp-ts/ReadonlyArray";
import * as O from "fp-ts/Option";
import { Errors } from "@pagopa/io-react-native-wallet";
import { itwCredentialsSelector } from "../store/selectors";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import {
  shouldRequestStatusAttestation,
  getCredentialStatusAttestation
} from "../../common/utils/itwCredentialStatusAttestationUtils";
import { ReduxSagaEffect } from "../../../../types/utils";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { itwCredentialsStore } from "../store/actions";
import { updateMixpanelProfileProperties } from "../../../../mixpanelConfig/profileProperties";
import { updateMixpanelSuperProperties } from "../../../../mixpanelConfig/superProperties";
import { GlobalState } from "../../../../store/reducers/types";

export function* updateCredentialStatusAttestationSaga(
  credential: StoredCredential
): Generator<ReduxSagaEffect, StoredCredential> {
  try {
    const { parsedStatusAttestation, statusAttestation } = yield* call(
      getCredentialStatusAttestation,
      credential
    );
    return {
      ...credential,
      storedStatusAttestation: {
        credentialStatus: "valid",
        statusAttestation,
        parsedStatusAttestation: parsedStatusAttestation.payload
      }
    };
  } catch (error) {
    return {
      ...credential,
      storedStatusAttestation: {
        credentialStatus:
          error instanceof Errors.CredentialInvalidStatusError
            ? "invalid" // The credential was revoked
            : "unknown" // We do not have enough information on the status, the error was unexpected
      }
    };
  }
}

/**
 * This saga is responsible to check the status attestation for each credential in the wallet.
 */
export function* checkCredentialsStatusAttestation() {
  const state: GlobalState = yield* select();

  const isWalletValid = yield* select(itwLifecycleIsValidSelector);

  // Credentials can be requested only when the wallet is valid, i.e. the eID was issued
  if (!isWalletValid) {
    return;
  }

  const { credentials } = yield* select(itwCredentialsSelector);

  const credentialsToCheck = pipe(
    credentials,
    RA.filterMap(O.filter(shouldRequestStatusAttestation))
  );

  if (credentialsToCheck.length === 0) {
    return;
  }

  const updatedCredentials = yield* all(
    credentialsToCheck.map(credential =>
      call(updateCredentialStatusAttestationSaga, credential)
    )
  );

  yield* put(itwCredentialsStore(updatedCredentials));

  void updateMixpanelProfileProperties(state);
  void updateMixpanelSuperProperties(state);
}
