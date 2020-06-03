/**
 * This module implements the types and a client for retrieving the static
 * content published at https://github.com/pagopa/io-services-metadata
 */
import {
  basicResponseDecoder,
  BasicResponseType,
  createFetchRequestForApi,
  IGetApiRequestType
} from "italia-ts-commons/lib/requests";
import { ServiceId } from "../../definitions/backend/ServiceId";
import { Municipality as MunicipalityMedadata } from "../../definitions/content/Municipality";
import { Service as ServiceMetadata } from "../../definitions/content/Service";
import { ServicesByScope } from "../../definitions/content/ServicesByScope";
import { contentRepoUrl } from "../config";
import { CodiceCatastale } from "../types/MunicipalityCodiceCatastale";
import { defaultRetryingFetch } from "../utils/fetch";
import { IdpsTextData } from "../../definitions/content/IdpsTextData";

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
  url: params =>
    `/municipalities/${params.codiceCatastale[0]}/${
      params.codiceCatastale[1]
    }/${params.codiceCatastale}.json`,
  query: _ => ({}),
  headers: _ => ({}),
  response_decoder: basicResponseDecoder(MunicipalityMedadata)
};

type GetServicesByScopeT = IGetApiRequestType<
  void,
  never,
  never,
  BasicResponseType<ServicesByScope>
>;

const getServicesByScopeT: GetServicesByScopeT = {
  method: "get",
  url: () => `/services/servicesByScope.json`,
  query: _ => ({}),
  headers: _ => ({}),
  response_decoder: basicResponseDecoder(ServicesByScope)
};

type GetIdpsTextDataT = IGetApiRequestType<
  void,
  never,
  never,
  BasicResponseType<IdpsTextData>
>;

const getIdpsTextDataT: GetIdpsTextDataT = {
  method: "get",
  url: () => `/idps/idps.json`,
  query: _ => ({}),
  headers: _ => ({}),
  response_decoder: basicResponseDecoder(IdpsTextData)
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
    getMunicipality: createFetchRequestForApi(getMunicipalityT, options),
    getServicesByScope: createFetchRequestForApi(getServicesByScopeT, options),
    getIdpsTextData: createFetchRequestForApi(getIdpsTextDataT, options)
  };
}
