// FIX ME: remove this mocked clients when a new backend definition that includes the real ones is released.
// Jira: https://pagopa.atlassian.net/browse/IOPID-264

import { identity } from "fp-ts/lib/function";
import {
  ApiHeaderJson,
  createFetchRequestForApi,
  TypeofApiCall
} from "@pagopa/ts-commons/lib/requests";
import {
  getFastLoginNonceDecoder,
  GetNonceT,
  NonceResponse
} from "./mockedFunctionsAndTypes";

// client for Nonce

export function createMockNonceClient({
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
