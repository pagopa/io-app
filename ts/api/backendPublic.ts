import * as t from "io-ts";
import {
  basicResponseDecoder,
  BasicResponseType,
  createFetchRequestForApi,
  IGetApiRequestType
} from "italia-ts-commons/lib/requests";
import { ServerInfo } from "../../definitions/backend/ServerInfo";
import { Timestamp } from "../../definitions/backend/Timestamp";
import { defaultRetryingFetch } from "../utils/fetch";

type GetServerInfoT = IGetApiRequestType<
  {},
  never,
  never,
  BasicResponseType<ServerInfo>
>;

export const BackendStatus = t.intersection(
  [
    t.interface({
      last_update: Timestamp,
      refresh_interval: t.string
    }),
    ServerInfo
  ],
  "BackendStatus"
);
export type BackendStatus = t.TypeOf<typeof BackendStatus>;

type GetStatusT = IGetApiRequestType<
  {},
  never,
  never,
  BasicResponseType<BackendStatus>
>;

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

  const getStatusT: GetStatusT = {
    method: "get",
    url: () => "/status",
    query: _ => ({}),
    headers: () => ({}),
    response_decoder: basicResponseDecoder(BackendStatus)
  };

  const getServerInfoT: GetServerInfoT = {
    method: "get",
    url: () => "/info",
    query: _ => ({}),
    headers: () => ({}),
    response_decoder: basicResponseDecoder(ServerInfo)
  };

  return {
    getServerInfo: createFetchRequestForApi(getServerInfoT, options),
    getStatus: createFetchRequestForApi(getStatusT, options)
  };
}
