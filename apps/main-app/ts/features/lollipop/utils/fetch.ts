import { PublicKey, sign } from "@pagopa/io-react-native-crypto";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import URLParse from "url-parse";

import {
  getSignAlgorithm,
  LollipopConfig,
  SignPromiseResult,
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
  keyInfo: KeyInfo,
  maxRetries?: number,
  timeout?: Millisecond
) => {
  const timeoutFetch = toFetchTimeout(timeout);
  const retriableFetch = toRetriableFetch(maxRetries);
  return retriableFetch(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const lollipopInit = await lollipopRequestInit(
        lollipopConfig,
        keyInfo,
        input,
        init
      );
      return await timeoutFetch(input, lollipopInit);
    }
  );
};

export const lollipopRequestInit = async (
  lollipopConfig: LollipopConfig,
  keyInfo: KeyInfo,
  input: RequestInfo | URL,
  init?: RequestInit
) => {
  const requestAndKeyInfo = toRequestAndKeyInfoForLPFetch(keyInfo, input, init);
  if (!requestAndKeyInfo) {
    throw Error(
      "Bad input parameters, unable to compose RequestAndKeyInfoForLPFetch"
    );
  }
  // eslint-disable-next-line functional/no-let
  let newInit = requestAndKeyInfo.init;
  const { body, bodyString, inputUrl, method, originalUrl } =
    extractHttpRequestComponents(
      requestAndKeyInfo.input,
      requestAndKeyInfo.init
    );
  if (body) {
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
    ...(lollipopConfig.signBody ? ["Content-Digest", "Content-Type"] : []),
    "x-pagopa-lollipop-original-method",
    "x-pagopa-lollipop-original-url"
  ];

  const mainSignatureConfig: SignatureConfig = forgeSignatureConfig(
    signatureConfigForgeInput,
    keyInfo,
    signatureParams
  );

  newInit = addHeader(newInit, "x-pagopa-lollipop-original-method", method);
  newInit = addHeader(newInit, "x-pagopa-lollipop-original-url", originalUrl);
  const newInitHeaders = (newInit.headers as Record<string, string>) ?? {};
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

  const mainSignValue = await sign(mainSignatureBase, requestAndKeyInfo.keyTag);
  const customSignResult = await customContentToSignPromises(
    customContentToSignInput
  );
  // Add custom headers
  customSignResult.forEach(
    v => (newInit = addHeader(newInit, v.headerName, v.headerValue))
  );
  // Prepare custom signature inputs array
  const customSignatureInputs = customSignResult.map(v => v.signatureInput);
  // Prepare custom signature array
  const customSignatures = customSignResult.map(v => v.signature);
  // Setup signature array
  const signatures = [
    toSignatureHeaderValue(mainSignValue),
    ...customSignatures
  ];
  // Setup signature input array
  const signatureInputs = [mainSignatureInput, ...customSignatureInputs];
  // Add all to their corresponding headers
  newInit = addHeader(newInit, "signature", signatures.join(","));
  newInit = addHeader(newInit, "signature-input", signatureInputs.join(","));
  return newInit;
};

export const customContentSignatureBases = (
  customContent: CutsomContentToSignInput
): Array<CustomContentBaseSignature> => {
  const { customContentToSign } = customContent;
  if (!customContentToSign) {
    return [];
  }
  const customContentToSignKeys = Object.keys(customContentToSign);
  return customContentToSignKeys.map((headerPrefix, index) => {
    const headerIndex = index + 2;
    const headerName = `x-pagopa-lollipop-custom-${headerPrefix}`;
    const headerValue = customContentToSign[headerPrefix];
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
  });
};

export const customContentToSignPromises = async (
  customContent: CutsomContentToSignInput
): Promise<Array<SignPromiseResult>> => {
  const customContentSignature = customContentSignatureBases(customContent);
  try {
    return await Promise.all(
      customContentSignature.map(async customContentBase => {
        const signedValue = await sign(
          customContentBase.signatureBase,
          customContent.keyTag
        );
        return {
          headerIndex: customContentBase.headerIndex,
          headerPrefix: customContentBase.headerPrefix,
          headerName: customContentBase.headerName,
          headerValue: customContentBase.headerValue,
          signature: toSignatureHeaderValue(
            signedValue,
            customContentBase.headerIndex
          ),
          signatureInput: customContentBase.signatureInput
        };
      })
    );
  } catch {
    return [];
  }
};

export type CustomContentBaseSignature = SignatureBaseResult & {
  headerIndex: number;
  headerName: string;
  headerPrefix: string;
  headerValue: string;
};

export type CutsomContentToSignInput = Required<Pick<KeyInfo, "keyTag">> & {
  customContentToSign: Record<string, string> | undefined;
  keyInfo: KeyInfo;
  signatureConfigForgeInput: SignatureConfigForgeInput;
};

export type SignatureConfigForgeInput = {
  inputUrl: URLParse;
  keyTag: string;
  lollipopConfig: LollipopConfig;
  method: string;
  publicKey: PublicKey;
};

type RequestAndKeyInfoForLPFetch = Pick<
  SignatureConfigForgeInput,
  "keyTag" | "method" | "publicKey"
> & {
  headers: HeadersInit;
  init: RequestInit;
  input: string;
};

/**
 * Add a pair header:value to the current fetch init.headers.
 */
function addHeader(
  init: RequestInit,
  headerName: string,
  headerValue: number | string
) {
  return {
    ...init,
    headers: {
      ...init.headers,
      [headerName]: headerValue
    }
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
