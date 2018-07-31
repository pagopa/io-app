/**
 * This module implements the types and a client for retrieving the static
 * content published at https://github.com/teamdigitale/italia-services-metadata
 */

import * as t from "io-ts";

import {
  basicResponseDecoder,
  BasicResponseType,
  createFetchRequestForApi,
  IGetApiRequestType
} from "italia-ts-commons/lib/requests";
import {
  NonEmptyString,
  OrganizationFiscalCode
} from "italia-ts-commons/lib/strings";

import { defaultRetryingFetch } from "../utils/fetch";

import { ServiceId } from "../../definitions/backend/ServiceId";

//
// Definition of Service metadata
//
// TODO: generate from specs https://www.pivotaltracker.com/story/show/159440146

const ServiceMetadata = t.partial({
  description: NonEmptyString
});

export type ServiceMetadata = t.TypeOf<typeof ServiceMetadata>;

export type GetServiceT = IGetApiRequestType<
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

//
// Definition of Organization metadata
//
// TODO: generate from specs https://www.pivotaltracker.com/story/show/159440146

const OrganizationMetadata = t.partial({
  cod_amm: t.string,
  des_amm: t.string,
  Comune: t.string,
  nome_resp: t.string,
  cogn_resp: t.string,
  Cap: t.string,
  Provincia: t.string,
  Regione: t.string,
  sito_istituzionale: t.string,
  Indirizzo: t.string,
  titolo_resp: t.string,
  tipologia_istat: t.string,
  tipologia_amm: t.string,
  acronimo: t.string,
  cf_validato: t.string,
  Cf: t.string,
  mail1: t.string,
  tipo_mail1: t.string,
  mail2: t.string,
  tipo_mail2: t.string,
  mail3: t.string,
  tipo_mail3: t.string,
  mail4: t.string,
  tipo_mail4: t.string,
  mail5: t.string,
  tipo_mail5: t.string,
  url_facebook: t.string,
  url_twitter: t.string,
  url_googleplus: t.string,
  url_youtube: t.string,
  liv_accessibili: t.string
});

export type OrganizationMetadata = t.TypeOf<typeof OrganizationMetadata>;

export type GetOrganizationT = IGetApiRequestType<
  {
    organizationFiscalCode: OrganizationFiscalCode;
  },
  never,
  never,
  BasicResponseType<OrganizationMetadata>
>;

const getOrganizationT: GetOrganizationT = {
  method: "get",
  url: params =>
    `/amministrazioni/${params.organizationFiscalCode[0]}${
      params.organizationFiscalCode[1]
    }/${params.organizationFiscalCode}.json`,
  query: _ => ({}),
  headers: _ => ({}),
  response_decoder: basicResponseDecoder(OrganizationMetadata)
};

/**
 * A client for the static content
 */
export function ContentClient(fetchApi: typeof fetch = defaultRetryingFetch()) {
  const options = {
    baseUrl:
      "https://raw.githubusercontent.com/teamdigitale/italia-services-metadata/services-cards",
    fetchApi
  };

  return {
    getService: createFetchRequestForApi(getServiceT, options),
    getOrganization: createFetchRequestForApi(getOrganizationT, options)
  };
}
