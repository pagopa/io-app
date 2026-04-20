import { Errors } from "@pagopa/io-react-native-wallet";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { all, call, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { ReduxSagaEffect } from "../../../../types/utils";
import { trackItwStatusCredentialAssertionFailure } from "../../analytics";
import { syncItwAnalyticsProperties } from "../../analytics/saga";
import { getMixPanelCredential } from "../../analytics/utils";
import {
  itwUnverifiedCredentialsCounterReset,
  itwUnverifiedCredentialsCounterUp
} from "../../common/store/actions/securePreferences";
import {
  selectItwEnv,
  selectItwSpecsVersion
} from "../../common/store/selectors/environment";
import { itwUnverifiedCredentialsCounterLimitReached } from "../../common/store/selectors/securePreferences";
import { getEnv } from "../../common/utils/environment";
import {
  getCredentialStatusAssertion,
  shouldRequestStatusAssertion,
  StatusAssertionError
} from "../../common/utils/itwCredentialStatusAssertionUtils";
import { CredentialMetadata } from "../../common/utils/itwTypesUtils";
import {
  itwLifecycleIsITWalletValidSelector,
  itwLifecycleIsValidSelector
} from "../../lifecycle/store/selectors";
import {
  itwCredentialsRefreshStatusByType,
  itwCredentialsStore
} from "../store/actions";
import {
  itwCredentialSelector,
  itwCredentialsSelector
} from "../store/selectors";
import { CredentialsVault } from "../utils/vault";

const { isIssuerResponseError, IssuerResponseErrorCodes: Codes } = Errors;

export function* updateCredentialStatusAssertionSaga(
  metadata: CredentialMetadata
): Generator<ReduxSagaEffect, CredentialMetadata> {
  const env = yield* select(selectItwEnv);
  const itwVersion = yield* select(selectItwSpecsVersion);
  const isItwL3 = yield* select(itwLifecycleIsITWalletValidSelector);
  const mixpanelCredential = getMixPanelCredential(
    metadata.credentialType,
    isItwL3
  );
  try {
    const credential = yield* call(() =>
      CredentialsVault.get(metadata.credentialId)
    );
    if (!credential) {
      throw new Error(
        `Credential with id ${metadata.credentialId} not found in secure storage`
      );
    }

    const { parsedStatusAssertion, statusAssertion } = yield* call(
      getCredentialStatusAssertion,
      { metadata, credential },
      getEnv(env),
      itwVersion
    );
    return {
      ...metadata,
      storedStatusAssertion: {
        credentialStatus: "valid",
        statusAssertion,
        parsedStatusAssertion
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
 * This saga is responsible to check the status assertion for each credential in
 * the wallet.
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

  yield* call(syncItwAnalyticsProperties);
}

/**
 * Saga that updates a specific credential status assertion without additional
 * logic. It is triggered by the user when the credential status is unknown.
 */
export function* handleCredentialStatusAssertionRetry(
  action: ActionType<typeof itwCredentialsRefreshStatusByType>
) {
  const credential = yield* select(itwCredentialSelector(action.payload));

  if (O.isSome(credential)) {
    const updatedCredential = yield* call(
      updateCredentialStatusAssertionSaga,
      credential.value
    );
    yield* put(itwCredentialsStore([updatedCredential]));
  }
}
