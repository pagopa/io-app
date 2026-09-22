import { deleteKey, generate, PublicKey } from "@pagopa/io-react-native-crypto";
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
export const handleRegenerateEphemeralKey = async (
  keyTag: string,
  isMixpanelEnabled: boolean | null,
  dispatch: AppDispatch
) => {
  try {
    await deleteKey(keyTag);
    const regeneratedKeyTag = await generate(keyTag);

    dispatch(lollipopSetEphemeralPublicKey({ publicKey: regeneratedKeyTag }));
    if (isMixpanelEnabled) {
      trackLollipopKeyGenerationSuccess(regeneratedKeyTag.kty);
    }
    return regeneratedKeyTag;
  } catch (error) {
    const cryptoError = toCryptoError(error);
    trackLollipopIdpLoginFailure(cryptoError.message);
    if (isMixpanelEnabled) {
      trackLollipopKeyGenerationFailure(cryptoError.message);
    }
    dispatch(lollipopRemoveEphemeralPublicKey());
    return undefined;
  }
};
