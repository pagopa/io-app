import { deleteKey, generate, PublicKey } from "@pagopa/io-react-native-crypto";
import { pipe } from "fp-ts/lib/function";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import URLParse from "url-parse";

import { AppDispatch } from "../../App";
import {
  trackLollipopIdpLoginFailure,
  trackLollipopKeyGenerationFailure,
  trackLollipopKeyGenerationSuccess
} from "../../utils/analytics";
import { SignatureAlgorithm } from "./httpSignature/types/SignatureAlgorithms";
import { SignatureComponents } from "./httpSignature/types/SignatureComponents";
import {
  lollipopRemoveEphemeralPublicKey,
  lollipopSetEphemeralPublicKey
} from "./store/actions/lollipop";
import { toCryptoError } from "./utils/crypto";

export type LollipopConfig = {
  customContentToSign?: Record<string, string>;
  nonce: string;
  signBody?: boolean;
};

export type SignPromiseResult = {
  headerIndex: number;
  headerName: string;
  headerPrefix: string;
  headerValue: string;
  signature: string;
  signatureInput: string;
};

/**
 * Await the given promise, returning an empty array if it fails.
 */
export const chainSignPromises = async (
  promise: Promise<Array<SignPromiseResult>>
): Promise<Array<SignPromiseResult>> => {
  try {
    return await promise;
  } catch {
    return [];
  }
};

/**
 * Returns the http-signature algorithm used to sign the signature base specified by
 * the signature-input header.
 */
export function getSignAlgorithm(publicKey: PublicKey): SignatureAlgorithm {
  return publicKey.kty === "EC" ? "ecdsa-p256-sha256" : "rsa-pss-sha256";
}

/**
 * Utility function to forge the `SignatureComponents` based on the provided inputs.
 */
export function toSignatureComponents(
  method: string,
  inputUrl: URLParse
): SignatureComponents {
  return {
    method,
    authority: inputUrl.host,
    path: inputUrl.pathname,
    scheme: inputUrl.protocol,
    targetUri: inputUrl.toString(),
    originalUrl: inputUrl.toString()
  };
}

/**
 * Regenerate publicKey, it returns a Promise
 * with publicKey, if it was succesfully generated
 */
export const handleRegenerateEphemeralKey = (
  keyTag: string,
  isMixpanelEnabled: boolean | null,
  dispatch: AppDispatch
) =>
  pipe(
    keyTag,
    taskRegenerateKey,
    TE.fold(
      error => {
        trackLollipopIdpLoginFailure(error.message);
        if (isMixpanelEnabled) {
          trackLollipopKeyGenerationFailure(error.message);
        }
        dispatch(lollipopRemoveEphemeralPublicKey());
        return T.of(undefined);
      },
      key => {
        dispatch(lollipopSetEphemeralPublicKey({ publicKey: key }));
        if (isMixpanelEnabled) {
          trackLollipopKeyGenerationSuccess(key.kty);
        }
        return T.of(key);
      }
    )
  )();

export const taskRegenerateKey = (keyTag: string) =>
  pipe(
    TE.tryCatch(() => deleteKey(keyTag), toCryptoError),
    TE.chain(() => TE.tryCatch(() => generate(keyTag), toCryptoError))
  );
