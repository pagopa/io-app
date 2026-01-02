import { select, call, all, put } from "typed-redux-saga/macro";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Errors } from "@pagopa/io-react-native-wallet";
import { itwCredentialsSelector } from "../store/selectors";
import { CredentialMetadata } from "../../common/utils/itwTypesUtils";
import {
  shouldRequestStatusAssertion,
  getCredentialStatusAssertion,
  StatusAssertionError
} from "../../common/utils/itwCredentialStatusAssertionUtils";
import { ReduxSagaEffect } from "../../../../types/utils";
import {
  itwLifecycleIsITWalletValidSelector,
  itwLifecycleIsValidSelector
} from "../../lifecycle/store/selectors";
import { itwCredentialsStore } from "../store/actions";
import { updateMixpanelProfileProperties } from "../../../../mixpanelConfig/profileProperties";
import { updateMixpanelSuperProperties } from "../../../../mixpanelConfig/superProperties";
import { GlobalState } from "../../../../store/reducers/types";
import {
  getMixPanelCredential,
  trackItwStatusCredentialAssertionFailure
} from "../../analytics";
import { selectItwEnv } from "../../common/store/selectors/environment";
import { getEnv } from "../../common/utils/environment";
import { itwUnverifiedCredentialsCounterLimitReached } from "../../common/store/selectors/securePreferences";
import {
  itwUnverifiedCredentialsCounterReset,
  itwUnverifiedCredentialsCounterUp
} from "../../common/store/actions/securePreferences";
import { CredentialsVault } from "../utils/vault";

const { isIssuerResponseError, IssuerResponseErrorCodes: Codes } = Errors;

export function* updateCredentialStatusAssertionSaga(
  metadata: CredentialMetadata
): Generator<ReduxSagaEffect, CredentialMetadata> {
  const env = yield* select(selectItwEnv);
  const isItwL3 = yield* select(itwLifecycleIsITWalletValidSelector);
  const mixpanelCredential = getMixPanelCredential(
    metadata.credentialType,
    isItwL3
  );
  try {
    const credential = yield* call(() =>
      CredentialsVault.get(metadata.credentialType)
    );
    if (!credential) {
      throw new Error(
        `Credential of type ${metadata.credentialType} not found in vault`
      );
    }

    const { parsedStatusAssertion, statusAssertion } = yield* call(
      getCredentialStatusAssertion,
      { metadata, credential },
      getEnv(env)
    );
    return {
      ...metadata,
      storedStatusAssertion: {
        credentialStatus: "valid",
        statusAssertion,
        parsedStatusAssertion: parsedStatusAssertion.payload
      }
    };
  } catch (e) {
    if (isIssuerResponseError(e, Codes.CredentialInvalidStatus)) {
      const errorCode = pipe(
        StatusAssertionError.decode(e.reason),
        O.fromEither,
        O.map(x => x.error),
        O.toUndefined
      );

      trackItwStatusCredentialAssertionFailure({
        credential: mixpanelCredential,
        credential_status: errorCode || "invalid"
      });

      return {
        ...metadata,
        storedStatusAssertion: { credentialStatus: "invalid", errorCode }
      };
    }
    // We do not have enough information on the status, the error was unexpected
    trackItwStatusCredentialAssertionFailure({
      credential: mixpanelCredential,
      credential_status: "unknown",
      reason: e instanceof Error ? e.message : e
    });

    return {
      ...metadata,
      storedStatusAssertion: { credentialStatus: "unknown" }
    };
  }
}

/**
 * This saga is responsible to check the status assertion for each credential in the wallet.
 */
export function* checkCredentialsStatusAssertion() {
  const isWalletValid = yield* select(itwLifecycleIsValidSelector);

  // Credentials can be requested only when the wallet is valid, i.e. the eID was issued
  if (!isWalletValid) {
    return;
  }

  const credentials = yield* select(itwCredentialsSelector);
  const credentialsToCheck = Object.values(credentials).filter(
    shouldRequestStatusAssertion
  );

  if (credentialsToCheck.length === 0) {
    return;
  }

  const updatedCredentials = yield* all(
    credentialsToCheck.map(credential =>
      call(updateCredentialStatusAssertionSaga, credential)
    )
  );

  const failedCredentials = updatedCredentials.filter(
    c => c.storedStatusAssertion?.credentialStatus === "unknown"
  );

  const successfulCredentials = updatedCredentials.filter(
    c => c.storedStatusAssertion?.credentialStatus !== "unknown"
  );

  const hasFailures = failedCredentials.length > 0;
  const hasSuccesses = successfulCredentials.length > 0;

  const isLimitReached = yield* select(
    itwUnverifiedCredentialsCounterLimitReached
  );

  if (hasSuccesses) {
    yield* put(itwCredentialsStore(successfulCredentials));
  }

  if (hasFailures) {
    if (isLimitReached) {
      yield* put(itwCredentialsStore(failedCredentials));
    } else {
      yield* put(itwUnverifiedCredentialsCounterUp());
    }
  } else {
    yield* put(itwUnverifiedCredentialsCounterReset());
  }

  const state: GlobalState = yield* select();
  void updateMixpanelProfileProperties(state);
  void updateMixpanelSuperProperties(state);
}
