/**
 * This module implements the types and a client for retrieving the static
 * content published at https://github.com/teamdigitale/italia-services-metadata
 */

import {
  basicResponseDecoder,
  BasicResponseType,
  createFetchRequestForApi,
  IGetApiRequestType
} from "italia-ts-commons/lib/requests";

import { contentRepoUrl } from "../config";

import { defaultRetryingFetch } from "../utils/fetch";

import { ServiceId } from "../../definitions/backend/ServiceId";
import { Service as ServiceMetadata } from "../../definitions/content/Service";

type GetServiceT = IGetApiRequestType<
  {
    serviceId: ServiceId;
  },
  never,
  never,
  BasicResponseType<ServiceMetadata>
>;

const getServiceT: GetServiceT = {
  method: "get",
  url: params => `/services/${params.serviceId}.json`,
  query: _ => ({}),
  headers: _ => ({}),
  response_decoder: basicResponseDecoder(ServiceMetadata)
};

/**
 * A client for the static content
 */
export function ContentClient(fetchApi: typeof fetch = defaultRetryingFetch()) {
  const options = {
    baseUrl: contentRepoUrl,
    fetchApi
  };

  return {
    getService: createFetchRequestForApi(getServiceT, options)
  };
}
