/**
 * This module implements the types and a client for retrieving the static
 * content published at https://github.com/pagopa/io-services-metadata
 */
import {
  basicResponseDecoder,
  BasicResponseType,
  createFetchRequestForApi,
  IGetApiRequestType
} from "@pagopa/ts-commons/lib/requests";
import { BonusesAvailable } from "../../definitions/content/BonusesAvailable";
import { ContextualHelp } from "../../definitions/content/ContextualHelp";
import { Municipality as MunicipalityMedadata } from "../../definitions/content/Municipality";
import { SpidIdps } from "../../definitions/content/SpidIdps";
import { VersionInfo } from "../../definitions/content/VersionInfo";
import { Zendesk } from "../../definitions/content/Zendesk";
import { CoBadgeServices } from "../../definitions/pagopa/cobadge/configuration/CoBadgeServices";
import { AbiListResponse } from "../../definitions/pagopa/walletv2/AbiListResponse";
import { contentRepoUrl } from "../config";
import { CodiceCatastale } from "../types/MunicipalityCodiceCatastale";
import { defaultRetryingFetch } from "../utils/fetch";

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
    `/municipalities/${params.codiceCatastale[0]}/${params.codiceCatastale[1]}/${params.codiceCatastale}.json`,
  query: _ => ({}),
  headers: _ => ({}),
  response_decoder: basicResponseDecoder(MunicipalityMedadata)
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

type GetBonusListT = IGetApiRequestType<
  Record<string, unknown>,
  never,
  never,
  BasicResponseType<BonusesAvailable>
>;

const getAvailableBonusesT: GetBonusListT = {
  method: "get",
  url: () => "/bonus/bonus_available_v2.json",
  query: _ => ({}),
  headers: () => ({}),
  response_decoder: basicResponseDecoder(BonusesAvailable)
};

type GetAbisListT = IGetApiRequestType<
  void,
  never,
  never,
  BasicResponseType<AbiListResponse>
>;

const getAbisListT: GetAbisListT = {
  method: "get",
  url: () => "/status/abi.json",
  query: _ => ({}),
  headers: () => ({}),
  response_decoder: basicResponseDecoder(AbiListResponse)
};

type GetCoBadgeServicesT = IGetApiRequestType<
  void,
  never,
  never,
  BasicResponseType<CoBadgeServices>
>;
const getCobadgeServicesT: GetCoBadgeServicesT = {
  method: "get",
  url: () => "/status/cobadgeServices.json",
  query: _ => ({}),
  headers: () => ({}),
  response_decoder: basicResponseDecoder(CoBadgeServices)
};

type GetVersionInfoT = IGetApiRequestType<
  void,
  never,
  never,
  BasicResponseType<VersionInfo>
>;
const getVersionInfoT: GetVersionInfoT = {
  method: "get",
  url: () => "/status/versionInfo.json",
  query: _ => ({}),
  headers: () => ({}),
  response_decoder: basicResponseDecoder(VersionInfo)
};

type GetIdpsListT = IGetApiRequestType<
  void,
  never,
  never,
  BasicResponseType<SpidIdps>
>;

const getIdpsT: GetIdpsListT = {
  method: "get",
  url: () => "/spid/idps/list.json",
  query: _ => ({}),
  headers: () => ({}),
  response_decoder: basicResponseDecoder(SpidIdps)
};

type GetZendeskConfigT = IGetApiRequestType<
  void,
  never,
  never,
  BasicResponseType<Zendesk>
>;

const getZendeskConfigT: GetZendeskConfigT = {
  method: "get",
  url: () => "/assistanceTools/zendesk.json",
  query: _ => ({}),
  headers: () => ({}),
  response_decoder: basicResponseDecoder(Zendesk)
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
    getBonusAvailable: createFetchRequestForApi(getAvailableBonusesT, options),
    getMunicipality: createFetchRequestForApi(getMunicipalityT, options),
    getContextualHelp: createFetchRequestForApi(getContextualHelpT, options),
    getAbiList: createFetchRequestForApi(getAbisListT, options),
    getCobadgeServices: createFetchRequestForApi(getCobadgeServicesT, options),
    getVersionInfo: createFetchRequestForApi(getVersionInfoT, options),
    getIdps: createFetchRequestForApi(getIdpsT, options),
    getZendeskConfig: createFetchRequestForApi(getZendeskConfigT, options)
  };
}
