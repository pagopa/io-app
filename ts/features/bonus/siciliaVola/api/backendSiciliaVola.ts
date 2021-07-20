import {
  getMitVoucherTokenDefaultDecoder,
  GetMitVoucherTokenT
} from "../../../../../definitions/io_sicilia_vola_token/requestTypes";
import {
  ApiHeaderJson,
  composeHeaderProducers,
  createFetchRequestForApi
} from "italia-ts-commons/lib/requests";
import {
  tokenHeaderProducer,
  withBearerToken as withToken
} from "../../../../utils/api";
import { SessionToken } from "../../../../types/SessionToken";
import { defaultRetryingFetch } from "../../../../utils/fetch";

const GetMitVoucherToken: GetMitVoucherTokenT = {
  method: "get",
  url: () => "/api/v1/mitvoucher/auth/token",
  query: _ => ({}),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: getMitVoucherTokenDefaultDecoder()
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
    GetMitVoucherToken: withBearerToken(
      createFetchRequestForApi(GetMitVoucherToken, options)
    )
  };
};

export type BackendSiciliaVolaClient = ReturnType<
  typeof BackendSiciliaVolaClient
>;
