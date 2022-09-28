import {
  ApiHeaderJson,
  composeHeaderProducers,
  createFetchRequestForApi
} from "@pagopa/ts-commons/lib/requests";
import { Omit } from "@pagopa/ts-commons/lib/types";
import { pipe } from "fp-ts/lib/function";
import { AeroportiAmmessiInputBean } from "../../../../../definitions/api_sicilia_vola/AeroportiAmmessiInputBean";
import {
  annullaVoucherDefaultDecoder,
  AnnullaVoucherT,
  getAeroportiAmmessiDefaultDecoder,
  GetAeroportiAmmessiT,
  getListaComuniBySiglaProvinciaDefaultDecoder,
  GetListaComuniBySiglaProvinciaT,
  getListaProvinceByIdRegioneDefaultDecoder,
  GetListaProvinceByIdRegioneT,
  getListaRegioniDefaultDecoder,
  GetListaRegioniT,
  getPdfDefaultDecoder,
  GetPdfT,
  getStatiUEDefaultDecoder,
  GetStatiUET,
  getStatiVoucherDefaultDecoder,
  GetStatiVoucherT,
  getVoucherBeneficiarioDefaultDecoder,
  GetVoucherBeneficiarioT
} from "../../../../../definitions/api_sicilia_vola/requestTypes";
import { VoucherBeneficiarioInputBean } from "../../../../../definitions/api_sicilia_vola/VoucherBeneficiarioInputBean";
import { VoucherCodeInputBean } from "../../../../../definitions/api_sicilia_vola/VoucherCodeInputBean";
import { MitVoucherToken } from "../../../../../definitions/io_sicilia_vola_token/MitVoucherToken";
import {
  getMitVoucherTokenDefaultDecoder,
  GetMitVoucherTokenT
} from "../../../../../definitions/io_sicilia_vola_token/requestTypes";
import { SessionToken } from "../../../../types/SessionToken";
import {
  tokenHeaderProducer,
  withBearerToken as withToken
} from "../../../../utils/api";
import { defaultRetryingFetch } from "../../../../utils/fetch";

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
  headers: _ => ({}),
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
  response_decoder: getListaComuniBySiglaProvinciaDefaultDecoder()
};

/**
 * Get the list of the airports available for the voucher given a stateId, a longitude and a latitude
 */
const GetAeroportiAmmessi: GetAeroportiAmmessiT = {
  method: "post",
  url: _ =>
    `/api/v1/mitvoucher/data/rest/secured/beneficiario/aeroportiAmmessi`,
  query: _ => ({}),
  body: ({ body }) => JSON.stringify({ body }),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: getAeroportiAmmessiDefaultDecoder()
};

/**
/**
 * Revoke a voucher identified by id
 */
const PostAnnullaVoucher: AnnullaVoucherT = {
  method: "post",
  url: _ => `/api/v1/mitvoucher/data/rest/secured/beneficiario/annullaVoucher`,
  query: _ => ({}),
  body: ({ body }) => JSON.stringify(body),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: annullaVoucherDefaultDecoder()
};

/**
 * Get the list of user's vouchers
 *
 * TODO: modify post in get and add auth header when the swagger will be fixed
 */
const GetVoucherBeneficiario: GetVoucherBeneficiarioT = {
  method: "post",
  url: _ => `/api/v1/mitvoucher/data/rest/secured/beneficiario/ricercaVoucher`,
  query: _ => ({}),
  body: voucherListRequest => JSON.stringify(voucherListRequest),
  headers: ApiHeaderJson,
  response_decoder: getVoucherBeneficiarioDefaultDecoder()
};

/**
 * Get the possible voucher state
 *
 * TODO: modify post in get and add auth header when the swagger will be fixed
 */
const GetStatiVoucher: GetStatiVoucherT = {
  method: "get",
  url: _ => `/api/v1/mitvoucher/data/rest/secured/beneficiario/statiVoucher`,
  query: _ => ({}),
  headers: ApiHeaderJson,
  response_decoder: getStatiVoucherDefaultDecoder()
};

/**
 * Get the pdf voucher
 *
 */
const GetStampaVoucher: GetPdfT = {
  method: "post",
  url: _ => `/api/v1/mitvoucher/data/rest/secured/beneficiario/stampaVoucher`,
  query: _ => ({}),
  body: ({ body }) => JSON.stringify(body),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: getPdfDefaultDecoder()
};

const withSiciliaVolaToken =
  <P extends { Bearer: string }, R>(f: (p: P) => Promise<R>) =>
  (token: MitVoucherToken) =>
  async (po: Omit<P, "Bearer">): Promise<R> => {
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
    getAeroportiAmmessi: (
      avilableDestinationRequest: AeroportiAmmessiInputBean
    ) =>
      pipe(
        createFetchRequestForApi(GetAeroportiAmmessi, options),
        withSiciliaVolaToken,
        fn => (token: MitVoucherToken) =>
          fn(token)({ body: avilableDestinationRequest })
      ),
    getVoucherBeneficiario: (
      voucherListRequest: VoucherBeneficiarioInputBean
    ) =>
      // TODO: add auth header
      createFetchRequestForApi(
        GetVoucherBeneficiario,
        options
      )({ body: voucherListRequest }),
    getStatiVoucher: createFetchRequestForApi(GetStatiVoucher, options),
    getStampaVoucher: (voucherCode: VoucherCodeInputBean) =>
      pipe(
        createFetchRequestForApi(GetStampaVoucher, options),
        withSiciliaVolaToken,
        fn => (token: MitVoucherToken) => fn(token)({ body: voucherCode })
      ),
    postAnnullaVoucher: (voucherCode: VoucherCodeInputBean) =>
      pipe(
        createFetchRequestForApi(PostAnnullaVoucher, options),
        withSiciliaVolaToken,
        fn => (token: MitVoucherToken) => fn(token)({ body: voucherCode })
      )
  };
};

export type BackendSiciliaVolaClient = ReturnType<
  typeof BackendSiciliaVolaClient
>;
