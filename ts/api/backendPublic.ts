import {
  ApiHeaderJson,
  basicResponseDecoder,
  BasicResponseType,
  createFetchRequestForApi,
  IGetApiRequestType,
  IPostApiRequestType
} from "italia-ts-commons/lib/requests";
import { AccessToken } from "../../definitions/backend/AccessToken";
import { PasswordLogin } from "../../definitions/backend/PasswordLogin";
import { ServerInfo } from "../../definitions/backend/ServerInfo";
import { defaultRetryingFetch } from "../utils/fetch";
import { BackendStatus } from "../../definitions/content/BackendStatus";

type GetServerInfoT = IGetApiRequestType<
  Record<string, unknown>,
  never,
  never,
  BasicResponseType<ServerInfo>
>;

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

  const getServerInfoT: GetServerInfoT = {
    method: "get",
    // to avoid response caching
    url: () => `/info?ms=${new Date().getTime()}`,
    query: _ => ({}),
    headers: () => ({}),
    response_decoder: basicResponseDecoder(ServerInfo)
  };

  const postLoginTestT: PostTestLoginT = {
    method: "post",
    url: () => `/test-login`,
    query: _ => ({}),
    headers: ApiHeaderJson,
    body: (passwordLogin: PasswordLogin) => JSON.stringify(passwordLogin),
    response_decoder: basicResponseDecoder(AccessToken)
  };

  return {
    getServerInfo: createFetchRequestForApi(getServerInfoT, options),
    postTestLogin: createFetchRequestForApi(postLoginTestT, options)
  };
}
