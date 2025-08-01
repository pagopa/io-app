import { select, call, all, put } from "typed-redux-saga/macro";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Errors as LegacyErrors } from "@pagopa/io-react-native-wallet";
import { Errors } from "@pagopa/io-react-native-wallet-v2";
import { itwCredentialsSelector } from "../store/selectors";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import {
  shouldRequestStatusAttestation,
  getCredentialStatusAttestation,
  StatusAttestationError
} from "../../common/utils/itwCredentialStatusAttestationUtils";
import { ReduxSagaEffect } from "../../../../types/utils";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { itwCredentialsStore } from "../store/actions";
import { updateMixpanelProfileProperties } from "../../../../mixpanelConfig/profileProperties";
import { updateMixpanelSuperProperties } from "../../../../mixpanelConfig/superProperties";
import { GlobalState } from "../../../../store/reducers/types";
import {
  CREDENTIALS_MAP,
  trackItwStatusCredentialAttestationFailure
} from "../../analytics";
import { selectItwEnv } from "../../common/store/selectors/environment";
import { getEnv } from "../../common/utils/environment";

const { isIssuerResponseError, IssuerResponseErrorCodes: Codes } = Errors;

export function* updateCredentialStatusAttestationSaga(
  credential: StoredCredential
): Generator<ReduxSagaEffect, StoredCredential> {
  const env = yield* select(selectItwEnv);
  try {
    const { parsedStatusAttestation, statusAttestation } = yield* call(
      getCredentialStatusAttestation,
      credential,
      getEnv(env)
    );
    return {
      ...credential,
      storedStatusAttestation: {
        credentialStatus: "valid",
        statusAttestation,
        parsedStatusAttestation: parsedStatusAttestation.payload
      }
    };
  } catch (e) {
    if (
      isIssuerResponseError(e, Codes.CredentialInvalidStatus) ||
      LegacyErrors.isIssuerResponseError(e, Codes.CredentialInvalidStatus) // TODO: [SIW-2530] remove after full migration to API 1.0
    ) {
      const errorCode = pipe(
        StatusAttestationError.decode(e.reason),
        O.fromEither,
        O.map(x => x.error),
        O.toUndefined
      );

      trackItwStatusCredentialAttestationFailure({
        credential: CREDENTIALS_MAP[credential.credentialType],
        credential_status: errorCode || "invalid"
      });

      return {
        ...credential,
        storedStatusAttestation: { credentialStatus: "invalid", errorCode }
      };
    }
    // We do not have enough information on the status, the error was unexpected
    trackItwStatusCredentialAttestationFailure({
      credential: CREDENTIALS_MAP[credential.credentialType],
      credential_status: "unknown",
      reason: e instanceof Error ? e.message : e
    });

    return {
      ...credential,
      storedStatusAttestation: { credentialStatus: "unknown" }
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

  const credentials = yield* select(itwCredentialsSelector);
  const credentialsToCheck = Object.values(credentials).filter(
    shouldRequestStatusAttestation
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

  const state: GlobalState = yield* select();
  void updateMixpanelProfileProperties(state);
  void updateMixpanelSuperProperties(state);
}
