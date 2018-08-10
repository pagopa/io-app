/**
 * pagoPA backend client, with functions
 * to call the different API available
 */
import {
  ApiHeaderJson,
  AuthorizationBearerHeaderProducer,
  composeHeaderProducers,
  createFetchRequestForApi,
  IGetApiRequestType,
  IPostApiRequestType,
  IPutApiRequestType,
  ResponseDecoder
} from "italia-ts-commons/lib/requests";
import { PaymentResponse } from "../../definitions/pagopa/PaymentResponse";
import {
  PspListResponse,
  SessionResponse,
  TransactionListResponse,
  TransactionResponse,
  WalletListResponse,
  WalletResponse
} from "../types/pagopa";
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

type CheckPaymentType = IGetApiRequestType<
  {
    paymentId: string;
  },
  "Authorization",
  never,
  BasicResponseTypeWith401<PaymentResponse>
>;

type GetPspsListType = IGetApiRequestType<
  {
    paymentId: string;
  },
  "Authorization",
  "idPayment" | "paymentType",
  BasicResponseTypeWith401<PspListResponse>
>;

type UpdateWalletPspType = IPutApiRequestType<
  {
    walletId: number;
    pspId: number;
  },
  "Content-Type" | "Authorization",
  never,
  BasicResponseTypeWith401<WalletResponse>
>;

type PostPaymentType = IPostApiRequestType<
  {
    walletId: number;
    paymentId: string;
  },
  "Content-Type" | "Authorization",
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
  checkPayment: (
    pagoPaToken: string,
    paymentId: string
  ) => Promise<BasicResponseTypeWith401<PaymentResponse> | undefined>;
  getPspList: (
    pagoPaToken: string,
    paymentId: string
  ) => Promise<BasicResponseTypeWith401<PspListResponse> | undefined>;
  updateWalletPsp: (
    pagoPaToken: string,
    walletId: number,
    pspId: number
  ) => Promise<BasicResponseTypeWith401<WalletResponse> | undefined>;
  postPayment: (
    pagoPaToken: string,
    paymentId: string,
    walletId: number
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

  const checkPayment: (
    pagoPaToken: string
  ) => CheckPaymentType = pagoPaToken => ({
    method: "get",
    url: ({ paymentId }) => `/v1/payments/${paymentId}/actions/check`,
    query: () => ({}),
    headers: AuthorizationBearerHeaderProducer(pagoPaToken),
    response_decoder: basicResponseDecoderWith401AndCast<PaymentResponse>(
      PaymentResponse
    )
  });

  const getPspList: (pagoPaToken: string) => GetPspsListType = pagoPaToken => ({
    method: "get",
    url: () => "/v1/psps",
    query: ({ paymentId }) => ({
      paymentType: "CREDIT_CARD",
      idPayment: paymentId
    }),
    headers: AuthorizationBearerHeaderProducer(pagoPaToken),
    response_decoder: basicResponseDecoderWith401AndCast<PspListResponse>(
      PspListResponse
    )
  });

  const updateWalletPsp: (
    pagoPaToken: string
  ) => UpdateWalletPspType = pagoPaToken => ({
    method: "put",
    url: ({ walletId }) => `/v1/wallet/${walletId}`,
    query: () => ({}),
    body: ({ pspId }) =>
      JSON.stringify({
        data: {
          type: "CREDIT_CARD",
          idPsp: pspId
        }
      }),
    headers: composeHeaderProducers(
      AuthorizationBearerHeaderProducer(pagoPaToken),
      ApiHeaderJson
    ),
    response_decoder: basicResponseDecoderWith401AndCast<WalletResponse>(
      WalletResponse
    )
  });

  const postPayment: (
    pagoPaToken: string
  ) => PostPaymentType = pagoPaToken => ({
    method: "post",
    url: ({ paymentId }) => `/v1/payments/${paymentId}/actions/pay`,
    query: () => ({}),
    body: ({ walletId }) =>
      JSON.stringify({
        data: {
          tipo: "web",
          idWallet: `${walletId}`
        }
      }),
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
    getTransactions: (pagoPaToken: string) =>
      createFetchRequestForApi(getTransactions(pagoPaToken), options)({}),
    checkPayment: (pagoPaToken: string, paymentId: string) =>
      // new Promise(resolve =>
      //   resolve({ status: 200, value: {} as PaymentResponse, headers: {} })
      // ),
      createFetchRequestForApi(checkPayment(pagoPaToken), options)({
        paymentId
      }),
    getPspList: (pagoPaToken: string, paymentId: string) =>
      createFetchRequestForApi(getPspList(pagoPaToken), options)({
        paymentId
      }),
    updateWalletPsp: (pagoPaToken: string, walletId: number, pspId: number) =>
      createFetchRequestForApi(updateWalletPsp(pagoPaToken), options)({
        walletId,
        pspId
      }),
    postPayment: (pagoPaToken: string, paymentId: string, walletId: number) =>
      // new Promise(resolve =>
      //   resolve({
      //     status: 200,
      //     value: {
      //       data: {
      //         id: 2329,
      //         created: new Date("2018-08-08T20:16:41Z"),
      //         updated: new Date("2018-08-08T20:16:41Z"),
      //         amount: { amount: 1000 },
      //         grandTotal: { amount: 1000 },
      //         description: "pagamento fotocopie pratica",
      //         merchant: "Comune di Torino",
      //         idStatus: 3,
      //         statusMessage: "Confermato",
      //         error: false,
      //         success: true,
      //         fee: { amount: 1000 },
      //         token: "MjMyOQ==",
      //         idWallet: 2345,
      //         idPsp: 12345,
      //         idPayment: 4464,
      //         nodoIdPayment: "eced7084-6c8e-4f03-b3ed-d556692ce090"
      //       }
      //     },
      //     headers: {}
      //   })
      // )
      createFetchRequestForApi(postPayment(pagoPaToken), options)({
        paymentId,
        walletId
      })
  };
};
