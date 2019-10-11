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
import { Municipality as MunicipalityMedadata } from "../../definitions/content/Municipality";
import { Service as ServiceMetadata } from "../../definitions/content/Service";
import { CodiceCatastale } from "../types/MunicipalityCodiceCatastale";

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
  url: params => `/services/${params.serviceId.toLowerCase()}.json`,
  query: _ => ({}),
  headers: _ => ({}),
  response_decoder: basicResponseDecoder(ServiceMetadata)
};

type GetMunicipalityT = IGetApiRequestType<
  {
    codiceCatastale: CodiceCatastale;
  },
  never,
  never,
  BasicResponseType<MunicipalityMedadata>
>;

const getMunicipalityT: GetMunicipalityT = {
  method: "get",
  // https://github.com/teamdigitale/io-services-metadata/pull/53#issue-297680364
  url: params =>
    `/municipalities/${params.codiceCatastale[0]}/${
      params.codiceCatastale[1]
    }/${params.codiceCatastale}.json`,
  query: _ => ({}),
  headers: _ => ({}),
  response_decoder: basicResponseDecoder(MunicipalityMedadata)
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
    getService: createFetchRequestForApi(getServiceT, options),
    getMunicipality: createFetchRequestForApi(getMunicipalityT, options)
  };
}
