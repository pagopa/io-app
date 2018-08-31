/**
 * pagoPA backend client, with functions
 * to call the different API available
 */
import {
  AuthorizationBearerHeaderProducer,
  createFetchRequestForApi,
  IGetApiRequestType,
  ResponseDecoder,
  IPostApiRequestType,
  composeHeaderProducers,
  ApiHeaderJson
} from "italia-ts-commons/lib/requests";
import {
  SessionResponse,
  TransactionListResponse,
  WalletListResponse,
  WalletResponse,
  NullableWallet,
  PayRequest
} from "../types/pagopa";
import { defaultRetryingFetch } from "../utils/fetch";
import {
  basicResponseDecoderWith401,
  BasicResponseTypeWith401
} from "./backend";
import { TransactionResponse } from "../../definitions/pagopa/TransactionResponse";

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

type TokenParamType = Readonly<{
  token: string;
}>;

type GetSessionType = IGetApiRequestType<
  TokenParamType,
  never,
  keyof TokenParamType, // ?token=ABC... using the same name as the param
  BasicResponseTypeWith401<SessionResponse>
>;

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

type BoardCreditCardType = IPostApiRequestType<
  { wallet: NullableWallet },
  "Authorization" | "Content-Type",
  never,
  BasicResponseTypeWith401<WalletResponse>
>;

type BoardPayType = IPostApiRequestType<
  { payRequest: PayRequest },
  "Authorization" | "Content-Type",
  never,
  BasicResponseTypeWith401<TransactionResponse>
>;

export type PagoPaClient = Readonly<{
  getSession: (
    walletToken: string
  ) => Promise<BasicResponseTypeWith401<SessionResponse> | undefined>;
  getTransactions: (
    pagoPaToken: string
  ) => Promise<BasicResponseTypeWith401<TransactionListResponse> | undefined>;
  getWallets: (
    pagoPaToken: string
  ) => Promise<BasicResponseTypeWith401<WalletListResponse> | undefined>;
  boardCreditCard: (
    pagoPaToken: string,
    wallet: NullableWallet
  ) => Promise<BasicResponseTypeWith401<WalletResponse> | undefined>;
  boardPay: (
    pagoPaToken: string,
    payRequest: PayRequest
  ) => Promise<BasicResponseTypeWith401<TransactionResponse> | undefined>;
}>;

export const PagoPaClient = (
  baseUrl: string,
  // token: string,
  fetchApi: typeof fetch = defaultRetryingFetch()
): PagoPaClient => {
  const options = { baseUrl, fetchApi };

  const getSession: GetSessionType = {
    method: "get",
    url: _ => "/v1/users/actions/start-session",
    query: t => t,
    headers: () => ({}),
    response_decoder: basicResponseDecoderWith401AndCast<SessionResponse>(
      SessionResponse
    )
  };

  const getTransactions: (
    pagoPaToken: string
  ) => GetTransactionsType = pagoPaToken => ({
    method: "get",
    url: () => "/v1/transactions",
    query: () => ({}),
    headers: AuthorizationBearerHeaderProducer(pagoPaToken),
    response_decoder: basicResponseDecoderWith401AndCast<
      TransactionListResponse
    >(TransactionListResponse)
  });

  const getWallets: (pagoPaToken: string) => GetWalletsType = pagoPaToken => ({
    method: "get",
    url: () => "/v1/wallet",
    query: () => ({}),
    headers: AuthorizationBearerHeaderProducer(pagoPaToken),
    response_decoder: basicResponseDecoderWith401AndCast<WalletListResponse>(
      WalletListResponse
    )
  });

  const boardCreditCard: (
    pagoPaToken: string
  ) => BoardCreditCardType = pagoPaToken => ({
    method: "post",
    url: () => "/v1/wallet/cc",
    query: () => ({}),
    body: ({ wallet }) =>
      JSON.stringify({
        data: wallet
      }),
    headers: composeHeaderProducers(
      AuthorizationBearerHeaderProducer(pagoPaToken),
      ApiHeaderJson
    ),
    response_decoder: basicResponseDecoderWith401AndCast<WalletResponse>(
      WalletResponse
    )
  });

  const boardPay: (pagoPaToken: string) => BoardPayType = pagoPaToken => ({
    method: "post",
    url: () => "/v1/payments/cc/actions/pay",
    query: () => ({}),
    body: ({ payRequest }) => JSON.stringify(payRequest),
    headers: composeHeaderProducers(
      AuthorizationBearerHeaderProducer(pagoPaToken),
      ApiHeaderJson
    ),
    response_decoder: basicResponseDecoderWith401AndCast<TransactionResponse>(
      TransactionResponse
    )
  });

  return {
    getSession: (walletToken: string) =>
      createFetchRequestForApi(getSession, options)({ token: walletToken }),
    getWallets: (pagoPaToken: string) =>
      createFetchRequestForApi(getWallets(pagoPaToken), options)({}),
    getTransactions: async (pagoPaToken: string) =>
      createFetchRequestForApi(getTransactions(pagoPaToken), options)({}),
    boardCreditCard: (pagoPaToken: string, wallet: NullableWallet) =>
      createFetchRequestForApi(boardCreditCard(pagoPaToken), options)({
        wallet
      }),
    boardPay: async (pagoPaToken: string, payRequest: PayRequest) =>
      createFetchRequestForApi(boardPay(pagoPaToken), options)({
        payRequest
      })
  };
};
