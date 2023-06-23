import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { deleteKey, generate, PublicKey } from "@pagopa/io-react-native-crypto";
import URLParse from "url-parse";
import {
  trackLollipopIdpLoginFailure,
  trackLollipopKeyGenerationFailure,
  trackLollipopKeyGenerationSuccess
} from "../../utils/analytics";
import { AppDispatch } from "../../App";
import { getAppVersion } from "../../utils/appVersion";
import { isLocalEnv } from "../../utils/environment";
import { SignatureAlgorithm } from "./httpSignature/types/SignatureAlgorithms";
import { SignatureComponents } from "./httpSignature/types/SignatureComponents";
import { toCryptoError } from "./utils/crypto";
import {
  lollipopRemovePublicKey,
  lollipopSetPublicKey
} from "./store/actions/lollipop";

export type LollipopConfig = {
  nonce: string;
  customContentToSign?: Record<string, string>;
  signBody?: boolean;
};

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
 * Returns the http-signature algorithm used to sign the signature base specified by
 * the signature-input header.
 */
export function getSignAlgorithm(publicKey: PublicKey): SignatureAlgorithm {
  return publicKey.kty === "EC" ? "ecdsa-p256-sha256" : "rsa-pss-sha256";
}

export type SignPromiseResult = {
  headerIndex: number;
  headerPrefix: string;
  headerName: string;
  headerValue: string;
  signature: string;
  signatureInput: string;
};

/**
 * Chains all custom sign promises passed as its input array.
 */
export const chainSignPromises = (
  promises: Array<TE.TaskEither<Error, SignPromiseResult>>
) =>
  pipe(
    promises,
    A.sequence(TE.ApplicativePar),
    TE.getOrElse(() => T.of([] as Array<SignPromiseResult>))
  )();

/**
 * Regenerate publicKey, it returns a Promise
 * with publicKey, if it was succesfully generated
 */
export const handleRegenerateKey = (
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
        dispatch(lollipopRemovePublicKey());
        return T.of(undefined);
      },
      key => {
        dispatch(lollipopSetPublicKey({ publicKey: key }));
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

export const getLollipopLoginHeaders = (
  publicKey: PublicKey,
  hashAlgorithm: string,
  isFastLogin: boolean
) => ({
  "x-pagopa-lollipop-pub-key": Buffer.from(JSON.stringify(publicKey)).toString(
    "base64"
  ),
  "x-pagopa-lollipop-pub-key-hash-algo": hashAlgorithm,
  "x-pagopa-app-version": isLocalEnv ? getAppVersion() : undefined,
  "x-pagopa-login-type": isFastLogin ? "LV" : undefined
});
