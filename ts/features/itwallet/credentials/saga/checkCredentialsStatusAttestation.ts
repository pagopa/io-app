import { select, call, all, put } from "typed-redux-saga/macro";
import { pipe } from "fp-ts/lib/function";
import * as RA from "fp-ts/ReadonlyArray";
import * as O from "fp-ts/Option";
import { Errors } from "@pagopa/io-react-native-wallet";
import { itwCredentialsSelector } from "../store/selectors";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import {
  shouldRequestStatusAttestation,
  getCredentialStatusAttestation
} from "../../common/utils/itwCredentialStatusAttestationUtils";
import { itwCredentialsMultipleUpdate } from "../store/actions";
import { ReduxSagaEffect } from "../../../../types/utils";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";

type PartialUpdatedCredential = Pick<
  StoredCredential,
  "credentialType" | "storedStatusAttestation"
>;

const canGetStatusAttestation = (credential: StoredCredential) =>
  credential.credentialType === CredentialType.DRIVING_LICENSE;

export function* updateCredentialStatusAttestationSaga(
  credential: StoredCredential
): Generator<ReduxSagaEffect, PartialUpdatedCredential> {
  try {
    const { parsedStatusAttestation, statusAttestation } = yield* call(
      getCredentialStatusAttestation,
      credential.credential,
      credential.keyTag
    );
    return {
      credentialType: credential.credentialType,
      storedStatusAttestation: {
        credentialStatus: "valid",
        statusAttestation,
        parsedStatusAttestation: parsedStatusAttestation.payload
      }
    };
  } catch (error) {
    return {
      credentialType: credential.credentialType,
      storedStatusAttestation: {
        credentialStatus:
          error instanceof Errors.StatusAttestationInvalid
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
  const isWalletValid = yield* select(itwLifecycleIsValidSelector);

  // Credentials can be requested only when the wallet is valid, i.e. the eID was issued
  if (!isWalletValid) {
    return;
  }

  const { credentials } = yield* select(itwCredentialsSelector);

  const credentialsToCheck = pipe(
    credentials,
    RA.filterMap(
      O.filter(
        x => canGetStatusAttestation(x) && shouldRequestStatusAttestation(x)
      )
    )
  );

  if (credentialsToCheck.length === 0) {
    return;
  }

  const updatedCredentials = yield* all(
    credentialsToCheck.map(credential =>
      call(updateCredentialStatusAttestationSaga, credential)
    )
  );

  yield* put(itwCredentialsMultipleUpdate(updatedCredentials));
}
