import { select, call, all, put } from "typed-redux-saga/macro";
import { pipe } from "fp-ts/lib/function";
import * as RA from "fp-ts/ReadonlyArray";
import * as O from "fp-ts/Option";
import { Errors } from "@pagopa/io-react-native-wallet";
import { itwCredentialsSelector } from "../store/selectors";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import {
  isStatusAttestationMissingOrExpired,
  getCredentialStatusAttestation
} from "../../common/utils/itwCredentialStatusAttestationUtils";
import { itwCredentialsMultipleUpdate } from "../store/actions";
import { ReduxSagaEffect } from "../../../../types/utils";

const canGetStatusAttestation = (credential: StoredCredential) =>
  credential.credentialType === CredentialType.DRIVING_LICENSE;

function* updateCredentialStatusAttestationSaga(
  credential: StoredCredential
): Generator<
  ReduxSagaEffect,
  Pick<StoredCredential, "credentialType" | "statusAttestation">
> {
  try {
    const { parsedStatusAttestation } = yield* call(
      getCredentialStatusAttestation,
      credential.credential,
      credential.keyTag
    );
    return {
      credentialType: credential.credentialType,
      statusAttestation: {
        credentialStatus: "valid",
        parsedStatusAttestation: parsedStatusAttestation.payload
      }
    };
  } catch (error) {
    return {
      credentialType: credential.credentialType,
      statusAttestation: {
        credentialStatus:
          error instanceof Errors.StatusAttestationInvalid
            ? "invalid" // The credential was revoked
            : "unknown", // We do not have enough information on the status, the error was unexpected
        parsedStatusAttestation: null
      }
    };
  }
}

/**
 * This saga is responsible to check the status attestation for each credential in the wallet.
 */
export function* checkCredentialsStatus() {
  const { credentials } = yield* select(itwCredentialsSelector);

  const credentialsToCheck = pipe(
    credentials,
    RA.filterMap(
      O.filter(
        x =>
          canGetStatusAttestation(x) && isStatusAttestationMissingOrExpired(x)
      )
    )
  );

  const updatedCredentials = yield* all(
    credentialsToCheck.map(credential =>
      call(updateCredentialStatusAttestationSaga, credential)
    )
  );

  yield* put(itwCredentialsMultipleUpdate(updatedCredentials));
}
