/**
 * pagoPA backend client, with functions
 * to call the different API available
 */
import {
  ApiHeaderJson,
  AuthorizationBearerHeaderProducer,
  composeHeaderProducers,
  createFetchRequestForApi,
  IDeleteApiRequestType,
  IGetApiRequestType,
  IPostApiRequestType,
  IPutApiRequestType,
  IResponseType,
  TypeofApiParams
} from "italia-ts-commons/lib/requests";

import { NullableWallet, PspListResponse } from "../types/pagopa";
import { SessionResponse } from "../types/pagopa";
import { TransactionListResponse } from "../types/pagopa";
import { TransactionResponse } from "../types/pagopa";
import { WalletListResponse } from "../types/pagopa";
import { WalletResponse } from "../types/pagopa";

import {
  addWalletCreditCardUsingPOSTDecoder,
  AddWalletCreditCardUsingPOSTT,
  checkPaymentUsingGETDefaultDecoder,
  CheckPaymentUsingGETT,
  deleteWalletUsingDELETEDefaultDecoder,
  DeleteWalletUsingDELETET,
  getPspListUsingGETDecoder,
  GetPspListUsingGETT,
  getTransactionsUsingGETDecoder,
  GetTransactionsUsingGETT,
  getWalletsUsingGETDecoder,
  GetWalletsUsingGETT,
  payCreditCardVerificationUsingPOSTDecoder,
  PayCreditCardVerificationUsingPOSTT,
  payUsingPOSTDecoder,
  PayUsingPOSTT,
  startSessionUsingGETDecoder,
  StartSessionUsingGETT,
  updateWalletUsingPUTDecoder,
  UpdateWalletUsingPUTT
} from "../../definitions/pagopa/requestTypes";

import { defaultRetryingFetch } from "../utils/fetch";

type MapTypeInApiResponse<T, S extends number, B> = T extends IResponseType<
  S,
  infer R
>
  ? IResponseType<S, B>
  : T;

type MapResponseType<T, S extends number, B> = T extends IGetApiRequestType<
  infer P1,
  infer H1,
  infer Q1,
  infer R1
>
  ? IGetApiRequestType<P1, H1, Q1, MapTypeInApiResponse<R1, S, B>>
  : T extends IPostApiRequestType<infer P2, infer H2, infer Q2, infer R2>
    ? IPostApiRequestType<P2, H2, Q2, MapTypeInApiResponse<R2, S, B>>
    : T extends IPutApiRequestType<infer P3, infer H3, infer Q3, infer R3>
      ? IPutApiRequestType<P3, H3, Q3, MapTypeInApiResponse<R3, S, B>>
      : T extends IDeleteApiRequestType<infer P4, infer H4, infer Q4, infer R4>
        ? IDeleteApiRequestType<P4, H4, Q4, MapTypeInApiResponse<R4, S, B>>
        : never;

const getSession: MapResponseType<
  StartSessionUsingGETT,
  200,
  SessionResponse
> = {
  method: "get",
  url: _ => "/v1/users/actions/start-session",
  query: _ => _,
  headers: () => ({}),
  response_decoder: startSessionUsingGETDecoder(SessionResponse)
};

const getTransactions: (
  pagoPaToken: string
) => MapResponseType<
  GetTransactionsUsingGETT,
  200,
  TransactionListResponse
> = pagoPaToken => ({
  method: "get",
  url: () => "/v1/transactions",
  query: () => ({}),
  headers: AuthorizationBearerHeaderProducer(pagoPaToken),
  response_decoder: getTransactionsUsingGETDecoder(TransactionListResponse)
});

const getWallets: (
  pagoPaToken: string
) => MapResponseType<
  GetWalletsUsingGETT,
  200,
  WalletListResponse
> = pagoPaToken => ({
  method: "get",
  url: () => "/v1/wallet",
  query: () => ({}),
  headers: AuthorizationBearerHeaderProducer(pagoPaToken),
  response_decoder: getWalletsUsingGETDecoder(WalletListResponse)
});

const checkPayment: (
  pagoPaToken: string
) => CheckPaymentUsingGETT = pagoPaToken => ({
  method: "get",
  url: ({ id }) => `/v1/payments/${id}/actions/check`,
  query: () => ({}),
  headers: AuthorizationBearerHeaderProducer(pagoPaToken),
  response_decoder: checkPaymentUsingGETDefaultDecoder()
});

const getPspList: (
  pagoPaToken: string
) => MapResponseType<
  GetPspListUsingGETT,
  200,
  PspListResponse
> = pagoPaToken => ({
  method: "get",
  url: () => "/v1/psps",
  query: ({ idPayment }) => ({
    paymentType: "CREDIT_CARD",
    idPayment
  }),
  headers: AuthorizationBearerHeaderProducer(pagoPaToken),
  response_decoder: getPspListUsingGETDecoder(PspListResponse)
});

const updateWalletPsp: (
  pagoPaToken: string
) => MapResponseType<
  UpdateWalletUsingPUTT,
  200,
  WalletResponse
> = pagoPaToken => ({
  method: "put",
  url: ({ id }) => `/v1/wallet/${id}`,
  query: () => ({}),
  body: ({ walletRequest }) => JSON.stringify(walletRequest),
  headers: composeHeaderProducers(
    AuthorizationBearerHeaderProducer(pagoPaToken),
    ApiHeaderJson
  ),
  response_decoder: updateWalletUsingPUTDecoder(WalletResponse)
});

const boardCreditCard: (
  pagoPaToken: string
) => MapResponseType<
  AddWalletCreditCardUsingPOSTT,
  200,
  WalletResponse
> = pagoPaToken => ({
  method: "post",
  url: () => "/v1/wallet/cc",
  query: () => ({}),
  body: ({ walletRequest }) => JSON.stringify(walletRequest),
  headers: composeHeaderProducers(
    AuthorizationBearerHeaderProducer(pagoPaToken),
    ApiHeaderJson
  ),
  response_decoder: addWalletCreditCardUsingPOSTDecoder(WalletResponse)
});

const postPayment: (
  pagoPaToken: string
) => MapResponseType<
  PayUsingPOSTT,
  200,
  TransactionResponse
> = pagoPaToken => ({
  method: "post",
  url: ({ id }) => `/v1/payments/${id}/actions/pay`,
  query: () => ({}),
  body: ({ payRequest }) => JSON.stringify(payRequest),
  headers: composeHeaderProducers(
    AuthorizationBearerHeaderProducer(pagoPaToken),
    ApiHeaderJson
  ),
  response_decoder: payUsingPOSTDecoder(TransactionResponse)
});

const boardPay: (
  pagoPaToken: string
) => MapResponseType<
  PayCreditCardVerificationUsingPOSTT,
  200,
  TransactionResponse
> = pagoPaToken => ({
  method: "post",
  url: () => "/v1/payments/cc/actions/pay",
  query: () => ({}),
  body: ({ payRequest }) => JSON.stringify(payRequest),
  headers: composeHeaderProducers(
    AuthorizationBearerHeaderProducer(pagoPaToken),
    ApiHeaderJson
  ),
  response_decoder: payCreditCardVerificationUsingPOSTDecoder(
    TransactionResponse
  )
});

const deleteWallet: (
  pagoPaToken: string
) => DeleteWalletUsingDELETET = pagoPaToken => ({
  method: "delete",
  url: ({ id }) => `/v1/wallet/${id}`,
  query: () => ({}),
  headers: AuthorizationBearerHeaderProducer(pagoPaToken),
  response_decoder: deleteWalletUsingDELETEDefaultDecoder()
});

export function PagoPaClient(
  baseUrl: string,
  walletToken: string,
  fetchApi: typeof fetch = defaultRetryingFetch()
) {
  const options = { baseUrl, fetchApi };

  return {
    walletToken,
    getSession: (
      wt: string // wallet token
    ) => createFetchRequestForApi(getSession, options)({ token: wt }),
    getWallets: (pagoPaToken: string) =>
      createFetchRequestForApi(getWallets(pagoPaToken), options)({}),
    getTransactions: (pagoPaToken: string) =>
      createFetchRequestForApi(getTransactions(pagoPaToken), options)({}),
    checkPayment: (
      pagoPaToken: string,
      id: TypeofApiParams<CheckPaymentUsingGETT>["id"]
    ) =>
      createFetchRequestForApi(checkPayment(pagoPaToken), options)({
        id
      }),
    getPspList: (
      pagoPaToken: string,
      idPayment: TypeofApiParams<GetPspListUsingGETT>["idPayment"]
    ) =>
      createFetchRequestForApi(getPspList(pagoPaToken), options)({
        idPayment
      }),
    updateWalletPsp: (
      pagoPaToken: string,
      id: TypeofApiParams<UpdateWalletUsingPUTT>["id"],
      walletRequest: TypeofApiParams<UpdateWalletUsingPUTT>["walletRequest"]
    ) =>
      createFetchRequestForApi(updateWalletPsp(pagoPaToken), options)({
        id,
        walletRequest
      }),
    postPayment: (
      pagoPaToken: string,
      id: TypeofApiParams<PayUsingPOSTT>["id"],
      payRequest: TypeofApiParams<PayUsingPOSTT>["payRequest"]
    ) =>
      createFetchRequestForApi(postPayment(pagoPaToken), options)({
        id,
        payRequest
      }),
    boardCreditCard: (pagoPaToken: string, walletRequest: NullableWallet) =>
      createFetchRequestForApi(boardCreditCard(pagoPaToken), options)({
        walletRequest: { data: walletRequest }
      }),
    boardPay: (
      pagoPaToken: string,
      payRequest: TypeofApiParams<
        PayCreditCardVerificationUsingPOSTT
      >["payRequest"]
    ) =>
      createFetchRequestForApi(boardPay(pagoPaToken), options)({
        payRequest
      }),
    deleteWallet: (
      pagoPaToken: string,
      id: TypeofApiParams<DeleteWalletUsingDELETET>["id"]
    ) =>
      createFetchRequestForApi(deleteWallet(pagoPaToken), options)({
        id
      })
  };
}

export type PagoPaClient = ReturnType<typeof PagoPaClient>;
