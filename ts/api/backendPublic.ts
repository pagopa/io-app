import {
  basicResponseDecoder,
  BasicResponseType,
  createFetchRequestForApi,
  IGetApiRequestType
} from "italia-ts-commons/lib/requests";

import { ServerInfo } from "../../definitions/backend/ServerInfo";

export type GetServerInfoT = IGetApiRequestType<
  {},
  never,
  never,
  BasicResponseType<ServerInfo>
>;

//
// Create client
//

export function BackendPublicClient(baseUrl: string) {
  const options = {
    baseUrl
  };

  const getServerInfoT: GetServerInfoT = {
    method: "get",
    url: () => "/info",
    query: _ => ({}),
    headers: () => ({}),
    response_decoder: basicResponseDecoder(ServerInfo)
  };

  return {
    getServerInfo: createFetchRequestForApi(getServerInfoT, options)
  };
}
