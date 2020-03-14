import * as t from "io-ts";
import { NonNegativeNumber } from "italia-ts-commons/lib/numbers";
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

export const BackendServicesStatus = t.interface({
  last_update: Timestamp,
  refresh_timeout: NonNegativeNumber
});
export type BackendServicesStatus = t.TypeOf<typeof BackendServicesStatus>;

type GetServicesStatusT = IGetApiRequestType<
  {},
  never,
  never,
  BasicResponseType<BackendServicesStatus>
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

  const getServerInfoT: GetServerInfoT = {
    method: "get",
    url: () => "/info",
    query: _ => ({}),
    headers: () => ({}),
    response_decoder: basicResponseDecoder(ServerInfo)
  };

  const getServiceStatusT: GetServicesStatusT = {
    method: "get",
    url: () => "/status",
    query: _ => ({}),
    headers: () => ({}),
    response_decoder: basicResponseDecoder(BackendServicesStatus)
  };

  return {
    getServerInfo: createFetchRequestForApi(getServerInfoT, options),
    getServicesStatus: createFetchRequestForApi(getServiceStatusT, options)
  };
}
