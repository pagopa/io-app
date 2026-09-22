import { PublicSession } from "@io-app/api-types/generated/definitions/session_manager/PublicSession";
import {
  deleteKey,
  generate,
  getPublicKey,
  PublicKey
} from "@pagopa/io-react-native-crypto";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { call, delay, put, select } from "typed-redux-saga/macro";
import { v4 as uuid } from "uuid";

import { mixpanelTrack } from "../../../mixpanel";
import { restartCleanApplication } from "../../../sagas/commons";
import { isMixpanelEnabled } from "../../../store/reducers/persistedPreferences";
import {
  buildEventProperties,
  trackLollipopKeyGenerationFailure,
  trackLollipopKeyGenerationSuccess
} from "../../../utils/analytics";
import { isTestEnv } from "../../../utils/environment";
import { sessionInvalid } from "../../authentication/common/store/actions";
import {
  lollipopKeyTagSave,
  lollipopRemovePublicKey,
  lollipopSetPublicKey
} from "../store/actions/lollipop";
import {
  lollipopKeyTagSelector,
  lollipopPublicKeySelector
} from "../store/reducers/lollipop";
import {
  KeyInfo,
  toBase64EncodedThumbprint,
  toCryptoError
} from "../utils/crypto";
import { DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER } from "../utils/login";

const WAIT_A_BIT_AFTER_SESSION_EXPIRED = 1000 as Millisecond;

export function* checkLollipopSessionAssertionAndInvalidateIfNeeded(
  publicKey: PublicKey | undefined,
  maybeSessionInformation: PublicSession | undefined
) {
  if (maybeSessionInformation != null && publicKey) {
    const publicKeyThumbprint = toBase64EncodedThumbprint(publicKey);
    const localAssertionRef = `${DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER}-${publicKeyThumbprint}`;
    const doesLocalAssertionRefMatchSession =
      localAssertionRef === maybeSessionInformation.lollipopAssertionRef;
    if (doesLocalAssertionRefMatchSession) {
      return true;
    }
  }

  void mixpanelTrack(
    "LOGIN_UNEXPECTED_REQUEST_ID",
    buildEventProperties("KO", undefined)
  );
  yield* put(sessionInvalid());
  // We want to take a little time before restarting the application
  // to let the action sessionInvalid be dispatched and handled.
  yield* delay(WAIT_A_BIT_AFTER_SESSION_EXPIRED);
  yield* call(restartCleanApplication);
  return false;
}

export function* deleteCurrentLollipopKeyAndGenerateNewKeyTag() {
  const maybeCurrentKeyTag = yield* select(lollipopKeyTagSelector);
  yield* call(deletePreviousCryptoKeyPair, maybeCurrentKeyTag);
  const newKeyTag = uuid();
  yield* put(lollipopKeyTagSave({ keyTag: newKeyTag }));
}

export function* generateLollipopKeySaga() {
  const maybeOldKeyTag = yield* select(lollipopKeyTagSelector);
  // Weather the user is logged in or not
  // we generate a key (if no one is present)
  // to have a key also for those users that update the app
  // and are already logged in.
  if (!maybeOldKeyTag) {
    const newKeyTag = uuid();
    yield* put(lollipopKeyTagSave({ keyTag: newKeyTag }));
    yield* call(cryptoKeyGenerationSaga, newKeyTag, maybeOldKeyTag);
  } else {
    try {
      // If we already have a keyTag, we check if there is
      // a public key tied with it.
      const publicKey = yield* call(getPublicKey, maybeOldKeyTag);
      yield* put(lollipopSetPublicKey({ publicKey }));
    } catch {
      // If there is no key it could be for two reasons:
      // - The user have a recent app and they logged out (the key is deleted).
      // - The user is logged in and is updating from an app version
      //    that didn't manage the key generation.
      // Having a key or an error in those cases is useful to show
      // the user an informative banner saying that their device
      // is not suitable for future version of IO.
      yield* call(cryptoKeyGenerationSaga, maybeOldKeyTag, undefined);
    }
  }
}

export function* getKeyInfo() {
  const keyTag = yield* select(lollipopKeyTagSelector);
  const publicKey = yield* select(lollipopPublicKeySelector);
  return yield* call(generateKeyInfo, keyTag, publicKey);
}

function* checkPublicKeyExists(keyTag: string) {
  try {
    const publicKey = yield* call(getPublicKey, keyTag);
    return publicKey != null;
  } catch {
    return false;
  }
}

/**
 * Generates a new crypto key pair.
 */
function* cryptoKeyGenerationSaga(
  keyTag: string,
  previousKeyTag: string | undefined
) {
  // Every new login we need to regenerate a brand new key pair.
  yield* call(deletePreviousCryptoKeyPair, previousKeyTag);
  yield* call(generateCryptoKeyPair, keyTag);
}

/**
 * Deletes the crypto key pair corresponding to the provided `keyTag`.
 */
function* deleteCryptoKeyPair(keyTag: string) {
  // Key is persisted even after uninstalling the application on iOS.
  const keyAlreadyExistsOnKeystore = yield* call(checkPublicKeyExists, keyTag);

  if (keyAlreadyExistsOnKeystore) {
    try {
      yield* call(deleteKey, keyTag);
      yield* put(lollipopRemovePublicKey());
    } catch (e) {
      const mixPanelEnabled = yield* select(isMixpanelEnabled);
      if (mixPanelEnabled) {
        const { message } = toCryptoError(e);
        yield* call(trackLollipopKeyGenerationFailure, message);
      }
    }
  }
}

/**
 * Deletes a previous saved crypto key pair.
 */
function* deletePreviousCryptoKeyPair(keyTag: string | undefined) {
  if (!keyTag) {
    return;
  }
  yield* call(deleteCryptoKeyPair, keyTag);
}

/**
 * Generates a new crypto key pair.
 */
function* generateCryptoKeyPair(keyTag: string) {
  try {
    // Remove an already existing key with the same tag.
    yield* call(deleteCryptoKeyPair, keyTag);

    const publicKey = yield* call(generate, keyTag);
    yield* put(lollipopSetPublicKey({ publicKey }));
    const mixPanelEnabled = yield* select(isMixpanelEnabled);
    if (mixPanelEnabled !== false) {
      yield* call(trackLollipopKeyGenerationSuccess, publicKey.kty);
    }
  } catch (e) {
    const mixPanelEnabled = yield* select(isMixpanelEnabled);
    if (mixPanelEnabled !== false) {
      const { message } = toCryptoError(e);
      yield* call(trackLollipopKeyGenerationFailure, message);
    }
  }
}

export const generateKeyInfo = (
  keyTag: string | undefined,
  maybePublicKey: PublicKey | undefined
) => {
  if (!keyTag || maybePublicKey == null) {
    return defaultKeyInfo();
  }
  return keyInfoFromKeyTagAndPublicKey(keyTag, maybePublicKey);
};

const keyInfoFromKeyTagAndPublicKey = (
  keyTag: string,
  publicKey: PublicKey
): KeyInfo => ({
  keyTag,
  publicKey,
  publicKeyThumbprint: toBase64EncodedThumbprint(publicKey)
});

const defaultKeyInfo = (): KeyInfo => ({
  keyTag: undefined,
  publicKey: undefined,
  publicKeyThumbprint: undefined
});

export const testable = isTestEnv
  ? {
      cryptoKeyGenerationSaga,
      deleteCryptoKeyPair,
      deletePreviousCryptoKeyPair,
      checkPublicKeyExists,
      generateCryptoKeyPair
    }
  : undefined;
