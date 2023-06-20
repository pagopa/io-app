// FIX ME: remove this mocked clients when a new backend definition that includes the real ones is released.
// Jira: https://pagopa.atlassian.net/browse/IOPID-264

import { withoutUndefinedValues } from "@pagopa/ts-commons/lib/types";
import { identity } from "fp-ts/lib/function";
import {
  ApiHeaderJson,
  createFetchRequestForApi,
  ReplaceRequestParams,
  RequestParams,
  TypeofApiCall
} from "@pagopa/ts-commons/lib/requests";
import {
  fastLoginDecoder,
  FastLoginResponse,
  FastLoginT,
  getFastLoginNonceDecoder,
  GetNonceT,
  NonceResponse
} from "./mockedFunctionsAndTypes";

// client for FastLogin

export function createLollipopClient({
  baseUrl,
  fetchApi,
  basePath = "/api/v1/fast-login"
}: {
  baseUrl: string;
  fetchApi: typeof fetch;
  basePath?: string;
}) {
  const options = {
    baseUrl,
    fetchApi
  };

  const fastLoginT: ReplaceRequestParams<
    FastLoginT,
    RequestParams<FastLoginT>
  > = {
    body: body => JSON.stringify(body),
    method: "post",
    headers: ({
      ["x-pagopa-lollipop-original-method"]: xPagopaLollipopOriginalMethod,
      ["x-pagopa-lollipop-original-url"]: xPagopaLollipopOriginalUrl,
      ["signature-input"]: signatureInput,
      ["signature"]: signature
    }) => ({
      "x-pagopa-lollipop-original-method": xPagopaLollipopOriginalMethod,

      "x-pagopa-lollipop-original-url": xPagopaLollipopOriginalUrl,

      "signature-input": signatureInput,

      signature,

      "Content-Type": "application/json"
    }),
    response_decoder: fastLoginDecoder(FastLoginResponse),
    url: () => `${basePath}`,

    query: () => withoutUndefinedValues({})
  };

  const fastLogin: TypeofApiCall<FastLoginT> = createFetchRequestForApi(
    fastLoginT,
    options
  );

  return {
    fastLogin: identity(fastLogin)
  };
}

// client for Nonce

export function createClient({
  baseUrl,
  fetchApi,
  basePath = "/api/v1/fast-login"
}: {
  baseUrl: string;
  fetchApi: typeof fetch;
  basePath?: string;
}) {
  const options = {
    baseUrl,
    fetchApi
  };

  const getNonceT: GetNonceT = {
    method: "post",
    url: () => `${basePath}/generate-nonce`,
    query: _ => ({}),
    body: body => JSON.stringify(body),
    headers: ApiHeaderJson,
    response_decoder: getFastLoginNonceDecoder(NonceResponse)
  };

  const getNonce: TypeofApiCall<GetNonceT> = createFetchRequestForApi(
    getNonceT,
    options
  );

  return {
    getNonce: identity(getNonce)
  };
}
