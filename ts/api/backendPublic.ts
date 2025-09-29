import {
  ApiHeaderJson,
  basicResponseDecoder,
  BasicResponseType,
  createFetchRequestForApi,
  IGetApiRequestType,
  IPostApiRequestType
} from "@pagopa/ts-commons/lib/requests";
import { PublicKey } from "@pagopa/io-react-native-crypto";
import { BackendStatus } from "../../definitions/content/BackendStatus";
import { defaultRetryingFetch } from "../utils/fetch";
import { AccessToken } from "../../definitions/session_manager/AccessToken";
import { PasswordLogin } from "../../definitions/session_manager/PasswordLogin";
import { getLoginHeaders } from "../features/authentication/common/utils/login";

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
    url: () => `/api/auth/v1/test-login`,
    query: _ => ({}),
    headers:
      publicKey && hashAlgorithm
        ? () => ({
            "Content-Type": "application/json",
            ...getLoginHeaders(publicKey, hashAlgorithm, !!isFastLogin, idpId)
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
