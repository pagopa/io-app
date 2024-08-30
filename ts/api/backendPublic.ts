import {
  ApiHeaderJson,
  basicResponseDecoder,
  BasicResponseType,
  createFetchRequestForApi,
  IGetApiRequestType,
  IPostApiRequestType
} from "@pagopa/ts-commons/lib/requests";
import { PublicKey } from "@pagopa/io-react-native-crypto";
import { AccessToken } from "../../definitions/backend/AccessToken";
import { PasswordLogin } from "../../definitions/backend/PasswordLogin";
import { BackendStatus } from "../../definitions/content/BackendStatus";
import { defaultRetryingFetch } from "../utils/fetch";
import { getLollipopLoginHeaders } from "../features/lollipop";

type PostTestLoginT = IPostApiRequestType<
  PasswordLogin,
  "Content-Type",
  never,
  BasicResponseType<AccessToken>
>;

type GetStatusT = IGetApiRequestType<
  Record<string, unknown>,
  never,
  never,
  BasicResponseType<BackendStatus>
>;

export function CdnBackendStatusClient(
  baseUrl: string,
  fetchApi: typeof fetch = defaultRetryingFetch()
) {
  const options = {
    baseUrl,
    fetchApi
  };

  const getStatusT: GetStatusT = {
    method: "get",
    // to avoid response caching
    url: () => `status/backend.json?ms=${new Date().getTime()}`,
    query: _ => ({}),
    headers: () => ({}),
    response_decoder: basicResponseDecoder(BackendStatus)
  };
  return {
    getStatus: createFetchRequestForApi(getStatusT, options)
  };
}
//
// Create client
//

export function BackendPublicClient(
  baseUrl: string,
  fetchApi: typeof fetch = defaultRetryingFetch()
) {
  const options = {
    baseUrl,
    fetchApi
  };

  const getPostLoginTestT = (
    publicKey?: PublicKey,
    hashAlgorithm?: string,
    isFastLogin?: boolean,
    idpId?: string
  ): PostTestLoginT => ({
    method: "post",
    url: () => `/test-login`,
    query: _ => ({}),
    headers:
      publicKey && hashAlgorithm
        ? () => ({
            "Content-Type": "application/json",
            ...getLollipopLoginHeaders(
              publicKey,
              hashAlgorithm,
              !!isFastLogin,
              idpId
            )
          })
        : ApiHeaderJson,
    body: (passwordLogin: PasswordLogin) => JSON.stringify(passwordLogin),
    response_decoder: basicResponseDecoder(AccessToken)
  });

  return {
    postTestLogin: (
      publicKey?: PublicKey,
      hashAlgorithm?: string,
      isFastLogin?: boolean
    ) =>
      createFetchRequestForApi(
        getPostLoginTestT(publicKey, hashAlgorithm, isFastLogin, "spid"),
        options
      )
  };
}
