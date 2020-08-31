import * as t from "io-ts";
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

type GetServerInfoT = IGetApiRequestType<
  {},
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

const BackendStatusMessage = t.interface({
  "it-IT": t.string,
  "en-EN": t.string
});

const BackendStatusR = t.interface({
  is_alive: t.boolean,
  message: BackendStatusMessage
});

export const BackendStatus = t.exact(BackendStatusR, "ServerInfo");
export type BackendStatus = t.TypeOf<typeof BackendStatus>;

type GetStatusT = IGetApiRequestType<
  {},
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
    url: () => `backend.json?ms=${new Date().getTime()}`,
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
