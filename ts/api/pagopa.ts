/**
 * pagoPA backend client, with functions
 * to call the different API available
 */
import {
  AuthorizationBearerHeaderProducer,
  createFetchRequestForApi,
  IGetApiRequestType,
  ResponseDecoder
} from "italia-ts-commons/lib/requests";
import { TransactionListResponse, WalletListResponse } from "../types/pagopa";
import { defaultRetryingFetch } from "../utils/fetch";
import {
  basicResponseDecoderWith401,
  BasicResponseTypeWith401
} from "./backend";

// builds on top of basicResponseDecoderWith401 and
// casts the result to a type T: this is in order to
// work around the fact that io-ts's refinements do
// not produce static types in agreement with the
// dynamic ones
// e.g. this produces an error
// const a: Amount = Amount.decode({ ... }).getOrElse({ ... })
const basicResponseDecoderWith401AndCast = <T>(
  type: any
): ResponseDecoder<BasicResponseTypeWith401<T>> =>
  basicResponseDecoderWith401(type);

type GetTransactionsType = IGetApiRequestType<
  {},
  "Authorization",
  never,
  BasicResponseTypeWith401<TransactionListResponse>
>;

type GetWalletsType = IGetApiRequestType<
  {},
  "Authorization",
  never,
  BasicResponseTypeWith401<WalletListResponse>
>;

export type PagoPaClient = Readonly<{
  getTransactions: (
    params: {}
  ) => Promise<BasicResponseTypeWith401<TransactionListResponse> | undefined>;
  getWallets: (
    parmas: {}
  ) => Promise<BasicResponseTypeWith401<WalletListResponse> | undefined>;
}>;

export const PagoPaClient = (
  baseUrl: string,
  token: string,
  fetchApi: typeof fetch = defaultRetryingFetch()
): PagoPaClient => {
  const options = {
    baseUrl,
    fetchApi
  };

  // header for the "Authorization: Bearer <token>" header
  const tokenHeaderProducer = AuthorizationBearerHeaderProducer(token);

  const getTransactions: GetTransactionsType = {
    method: "get",
    url: () => "/v1/transactions",
    query: () => ({}),
    headers: tokenHeaderProducer,
    response_decoder: basicResponseDecoderWith401AndCast<
      TransactionListResponse
    >(TransactionListResponse)
  };

  const getWallets: GetWalletsType = {
    method: "get",
    url: () => "/v1/wallet",
    query: () => ({}),
    headers: tokenHeaderProducer,
    response_decoder: basicResponseDecoderWith401AndCast<WalletListResponse>(
      WalletListResponse
    )
  };

  return {
    getTransactions: createFetchRequestForApi(getTransactions, options),
    getWallets: createFetchRequestForApi(getWallets, options)
  };
};
