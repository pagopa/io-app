import * as t from "io-ts";
import {
  basicResponseDecoder,
  BasicResponseType,
  createFetchRequestForApi,
  IGetApiRequestType
} from "italia-ts-commons/lib/requests";
import { ServerInfo } from "../../definitions/backend/ServerInfo";
import { defaultRetryingFetch } from "../utils/fetch";

type GetServerInfoT = IGetApiRequestType<
  {},
  never,
  never,
  BasicResponseType<ServerInfo>
>;

const ServicesStatus = t.interface({
  status: t.string
});
export type ServicesStatus = t.TypeOf<typeof ServicesStatus>;

type GetServicesStatusT = IGetApiRequestType<
  {},
  never,
  never,
  BasicResponseType<ServicesStatus>
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
    url: () => "/ping",
    query: _ => ({}),
    headers: () => ({}),
    response_decoder: basicResponseDecoder(ServicesStatus)
  };

  return {
    getServerInfo: createFetchRequestForApi(getServerInfoT, options),
    getServicesStatus: createFetchRequestForApi(getServiceStatusT, options)
  };
}
