import {
  ApiHeaderJson,
  composeHeaderProducers,
  createFetchRequestForApi
} from "italia-ts-commons/lib/requests";
import {
  getMitVoucherTokenDefaultDecoder,
  GetMitVoucherTokenT
} from "../../../../../definitions/io_sicilia_vola_token/requestTypes";
import {
  tokenHeaderProducer,
  withBearerToken as withToken
} from "../../../../utils/api";
import { SessionToken } from "../../../../types/SessionToken";
import { defaultRetryingFetch } from "../../../../utils/fetch";
import {
  getAeroportiBeneficiarioDefaultDecoder,
  GetAeroportiBeneficiarioT,
  GetListaComuniBySiglaProvinciaT,
  getListaProvinceByIdRegioneDefaultDecoder,
  GetListaProvinceByIdRegioneT,
  getListaRegioniDefaultDecoder,
  GetListaRegioniT,
  getStatiUEDefaultDecoder,
  GetStatiUET
} from "../../../../../definitions/api_sicilia_vola/requestTypes";
import { flip } from "fp-ts/lib/function";
import { Omit } from "italia-ts-commons/lib/types";
import { MitVoucherToken } from "../../../../../definitions/io_sicilia_vola_token/MitVoucherToken";

/**
 * Get the Sicilia Vola session token
 */
const GetMitVoucherToken: GetMitVoucherTokenT = {
  method: "get",
  url: () => "/api/v1/mitvoucher/auth/token",
  query: _ => ({}),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: getMitVoucherTokenDefaultDecoder()
};

/**
 * Get the list of states selectable by the user
 */
const GetStatiUE: GetStatiUET = {
  method: "get",
  url: () => "/api/v1/mitvoucher/data/rest/unsecured/statiUE",
  query: _ => ({}),
  headers: _ => ({
    "Ocp-Apim-Subscription-Key": "fe43f9a67c474aa294a1af798c760639"
  }),
  response_decoder: getStatiUEDefaultDecoder()
};

/**
 * Get the list of regions selectable by the user
 */
const GetListaRegioni: GetListaRegioniT = {
  method: "get",
  url: () => "/api/v1/mitvoucher/data/rest/unsecured/regioni",
  query: _ => ({}),
  headers: _ => ({}),
  response_decoder: getListaRegioniDefaultDecoder()
};

/**
 * Get the list of province selectable by the user given a regionID
 */
const GetListaProvinceByIdRegione: GetListaProvinceByIdRegioneT = {
  method: "get",
  url: params =>
    `/api/v1/mitvoucher/data/rest/unsecured/province/${params.idRegione}`,
  query: _ => ({}),
  headers: _ => ({}),
  response_decoder: getListaProvinceByIdRegioneDefaultDecoder()
};

/**
 * Get the list of municipalities selectable by the user given a province abbreviation
 */
const GetListaComuniBySiglaProvincia: GetListaComuniBySiglaProvinciaT = {
  method: "get",
  url: params =>
    `/api/v1/mitvoucher/data/rest/unsecured/comuni/${params.siglaProvincia}`,
  query: _ => ({}),
  headers: _ => ({}),
  response_decoder: getListaProvinceByIdRegioneDefaultDecoder()
};

/**
 * Get the list of municipalities selectable by the user given a province abbreviation
 */
const GetAeroportiBeneficiario: GetAeroportiBeneficiarioT = {
  method: "get",
  url: params =>
    `/api/v1/mitvoucher/data/rest/secured/beneficiario/aeroportiSede/${params.idRegione}`,
  query: _ => ({}),
  headers: h => ({
    Authorization: h.Bearer
  }),
  response_decoder: getAeroportiBeneficiarioDefaultDecoder()
};

const withSiciliaVolaToken = <P extends { Bearer: string }, R>(
  f: (p: P) => Promise<R>
) => (token: MitVoucherToken) => async (po: Omit<P, "Bearer">): Promise<R> => {
  const params = Object.assign({ Bearer: String(token.token) }, po) as P;
  return f(params);
};

// client for SiciliaVola to handle API communications
export const BackendSiciliaVolaClient = (
  baseUrl: string,
  token: SessionToken,
  fetchApi: typeof fetch = defaultRetryingFetch()
) => {
  const options = {
    baseUrl,
    fetchApi
  };
  const withBearerToken = withToken(token);
  return {
    getMitVoucherToken: withBearerToken(
      createFetchRequestForApi(GetMitVoucherToken, options)
    ),
    getStatiUE: createFetchRequestForApi(GetStatiUE, options),
    getListaRegioni: createFetchRequestForApi(GetListaRegioni, options),
    getListaProvinceByIdRegione: createFetchRequestForApi(
      GetListaProvinceByIdRegione,
      options
    ),
    getListaComuniBySiglaProvincia: createFetchRequestForApi(
      GetListaComuniBySiglaProvincia,
      options
    ),
    getAeroportiBeneficiario: (idRegione: number) =>
      flip(
        withSiciliaVolaToken(
          createFetchRequestForApi(GetAeroportiBeneficiario, options)
        )
      )({ idRegione })
  };
};

export type BackendSiciliaVolaClient = ReturnType<
  typeof BackendSiciliaVolaClient
>;
