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
import { ContextualHelp } from "../../definitions/content/ContextualHelp";
import { Municipality as MunicipalityMedadata } from "../../definitions/content/Municipality";
import { Service as ServiceMetadata } from "../../definitions/content/Service";
import { ServicesByScope } from "../../definitions/content/ServicesByScope";
import { contentRepoUrl } from "../config";
import { CodiceCatastale } from "../types/MunicipalityCodiceCatastale";
import { defaultRetryingFetch } from "../utils/fetch";

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

type GetContextualHelpT = IGetApiRequestType<
  void,
  never,
  never,
  BasicResponseType<ContextualHelp>
>;

const getContextualHelpT: GetContextualHelpT = {
  method: "get",
  url: () => `/contextualhelp/data.json`,
  query: _ => ({}),
  headers: _ => ({}),
  response_decoder: basicResponseDecoder(ContextualHelp)
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
    getContextualHelp: createFetchRequestForApi(getContextualHelpT, options)
  };
}
