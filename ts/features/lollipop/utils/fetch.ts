import URLParse from "url-parse";
import { PublicKey, sign } from "@pagopa/io-react-native-crypto";
import { pipe } from "fp-ts/lib/function";
import * as A from "fp-ts/lib/Array";
import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";

import {
  LollipopConfig,
  chainSignPromises,
  SignPromiseResult,
  getSignAlgorithm,
  toSignatureComponents
} from "..";
import { toFetchTimeout, toRetriableFetch } from "../../../utils/fetch";
import { generateDigestHeader } from "../httpSignature/digest";
import {
  generateSignatureBase,
  SignatureBaseResult,
  toSignatureHeaderValue
} from "../httpSignature/signature";
import { SignatureConfig } from "../httpSignature/types/SignatureConfig";
import { KeyInfo } from "./crypto";

/**
 * Decorates the current fetch with LolliPOP headers and http-signature
 */
export const lollipopFetch = (
  lollipopConfig: LollipopConfig,
  keyInfo: KeyInfo
) => {
  const timeoutFetch = toFetchTimeout();
  const retriableFetch = toRetriableFetch();
  return retriableFetch(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const requestAndKeyInfo = toRequestAndKeyInfoForLPFetch(
        keyInfo,
        input,
        init
      );
      if (requestAndKeyInfo) {
        // eslint-disable-next-line functional/no-let
        let newInit = requestAndKeyInfo.init;
        const { body, bodyString, inputUrl, method, originalUrl } =
          extractHttpRequestComponents(
            requestAndKeyInfo.input,
            requestAndKeyInfo.init
          );
        if (body) {
          console.log("🚀 body: ", bodyString);
          newInit = addHeader(
            newInit,
            "Content-Digest",
            generateDigestHeader(bodyString)
          );
        }

        const signatureConfigForgeInput: SignatureConfigForgeInput = {
          publicKey: requestAndKeyInfo.publicKey,
          keyTag: requestAndKeyInfo.keyTag,
          lollipopConfig,
          method,
          inputUrl
        };

        const signatureParams: Array<string> = [
          ...(lollipopConfig.signBody
            ? ["Content-Digest", "Content-Type"]
            : []),
          "x-pagopa-lollipop-original-method",
          "x-pagopa-lollipop-original-url"
        ];

        const mainSignatureConfig: SignatureConfig = forgeSignatureConfig(
          signatureConfigForgeInput,
          keyInfo,
          signatureParams
        );

        newInit = addHeader(
          newInit,
          "x-pagopa-lollipop-original-method",
          method
        );
        newInit = addHeader(
          newInit,
          "x-pagopa-lollipop-original-url",
          originalUrl
        );
        const newInitHeaders =
          (newInit.headers as Record<string, string>) ?? {};
        const {
          signatureBase: mainSignatureBase,
          signatureInput: mainSignatureInput
        } = generateSignatureBase(newInitHeaders, mainSignatureConfig, 1);

        const customContentToSignInput: CutsomContentToSignInput = {
          customContentToSign: lollipopConfig.customContentToSign,
          keyInfo,
          keyTag: requestAndKeyInfo.keyTag,
          signatureConfigForgeInput
        };

        try {
          const mainSignValue = await sign(
            mainSignatureBase,
            requestAndKeyInfo.keyTag
          );
          const customSignResult = await chainSignPromises(
            customContentToSignPromises(customContentToSignInput)
          );
          // Add custom headers
          customSignResult.forEach(
            v => (newInit = addHeader(newInit, v.headerName, v.headerValue))
          );
          // Prepare custom signature inputs array
          const customSignatureInputs = customSignResult.map(
            v => v.signatureInput
          );
          // Prepare custom signature array
          const customSignatures = customSignResult.map(v => v.signature);
          // Setup signature array
          const signatures = [
            toSignatureHeaderValue(mainSignValue),
            ...customSignatures
          ];
          // Setup signature input array
          const signatureInputs = [
            mainSignatureInput,
            ...customSignatureInputs
          ];
          // Add all to their corresponding headers
          newInit = addHeader(newInit, "signature", signatures.join(","));
          newInit = addHeader(
            newInit,
            "signature-input",
            signatureInputs.join(",")
          );
          return await timeoutFetch(input, newInit);
        } catch {
          return await timeoutFetch(input, init);
        }
      }
      return timeoutFetch(input, init);
    }
  );
};

export const customContentSignatureBases = (
  customContent: CutsomContentToSignInput
): Array<CustomContentBaseSignature> =>
  pipe(
    customContent.customContentToSign,
    O.fromNullable,
    O.fold(
      () => [],
      contentToSign =>
        pipe(
          Object.keys(contentToSign),
          A.mapWithIndex((index, headerPrefix) => {
            const headerIndex = index + 2;
            const headerName = `x-pagopa-lollipop-custom-${headerPrefix}`;
            const headerValue = contentToSign[headerPrefix];
            const customHeader = {
              [headerName]: headerValue
            };

            const customHeaderSignatureConfig = forgeSignatureConfig(
              customContent.signatureConfigForgeInput,
              customContent.keyInfo,
              [headerName]
            );

            const { signatureBase, signatureInput } = generateSignatureBase(
              customHeader,
              customHeaderSignatureConfig,
              headerIndex
            );

            return {
              signatureBase,
              signatureInput,
              headerIndex,
              headerPrefix,
              headerName,
              headerValue
            };
          })
        )
    )
  );

export const customContentToSignPromises = (
  customContent: CutsomContentToSignInput
): Array<TE.TaskEither<Error, SignPromiseResult>> =>
  pipe(
    customContentSignatureBases(customContent),
    A.map(customContentBase =>
      pipe(
        TE.tryCatch(
          () => sign(customContentBase.signatureBase, customContent.keyTag),
          error => new Error(`Failed to sign: ${error}`)
        ),
        TE.map(value => ({
          headerIndex: customContentBase.headerIndex,
          headerPrefix: customContentBase.headerPrefix,
          headerName: customContentBase.headerName,
          headerValue: customContentBase.headerValue,
          signature: toSignatureHeaderValue(
            value,
            customContentBase.headerIndex
          ),
          signatureInput: customContentBase.signatureInput
        }))
      )
    )
  );

export type CustomContentBaseSignature = {
  headerIndex: number;
  headerPrefix: string;
  headerName: string;
  headerValue: string;
} & SignatureBaseResult;

export type SignatureConfigForgeInput = {
  publicKey: PublicKey;
  keyTag: string;
  lollipopConfig: LollipopConfig;
  method: string;
  inputUrl: URLParse;
};

type RequestAndKeyInfoForLPFetch = {
  input: string;
  init: RequestInit;
  headers: HeadersInit;
} & Pick<SignatureConfigForgeInput, "publicKey" | "keyTag" | "method">;

export type CutsomContentToSignInput = {
  customContentToSign: Record<string, string> | undefined;
  signatureConfigForgeInput: SignatureConfigForgeInput;
  keyInfo: KeyInfo;
} & Required<Pick<KeyInfo, "keyTag">>;

function forgeSignatureConfig(
  forgeInput: SignatureConfigForgeInput,
  keyInfo: KeyInfo,
  signatureParams: Array<string>
): SignatureConfig {
  return {
    signAlgorithm: getSignAlgorithm(forgeInput.publicKey),
    signKeyTag: forgeInput.keyTag,
    signKeyId: keyInfo.publicKeyThumbprint ?? "",
    nonce: forgeInput.lollipopConfig.nonce,
    signatureComponents: toSignatureComponents(
      forgeInput.method,
      forgeInput.inputUrl
    ),
    signatureParams
  };
}

function extractHttpRequestComponents(input: string, init: RequestInit) {
  const inputUrl = new URLParse(input, true);
  const method = init.method?.toUpperCase() ?? "";
  const body = init.body;
  const bodyString = body as string;
  const originalUrl = inputUrl.toString();

  return { body, bodyString, inputUrl, method, originalUrl };
}

/**
 * Add a pair header:value to the current fetch init.headers.
 */
function addHeader(
  init: RequestInit,
  headerName: string,
  headerValue: string | number
) {
  return {
    ...init,
    headers: {
      ...init.headers,
      [headerName]: headerValue
    }
  };
}

/**
 * Check if the keyInfo and Request properties are properly initialized for fetching
 */
function toRequestAndKeyInfoForLPFetch(
  keyInfo: KeyInfo,
  input: RequestInfo | URL,
  init?: RequestInit
): RequestAndKeyInfoForLPFetch | undefined {
  return keyInfo.publicKey &&
    keyInfo.keyTag &&
    typeof input === "string" &&
    init?.headers &&
    init?.method
    ? {
        publicKey: keyInfo.publicKey,
        keyTag: keyInfo.keyTag,
        input,
        init,
        headers: init.headers,
        method: init.method
      }
    : undefined;
}
