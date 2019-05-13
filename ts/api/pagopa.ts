/**
 * pagoPA backend client, with functions
 * to call the different API available
 */
import { flip } from "fp-ts/lib/function";
import {
  AddResponseType,
  ApiHeaderJson,
  AuthorizationBearerHeaderProducer,
  basicErrorResponseDecoder,
  composeHeaderProducers,
  composeResponseDecoders,
  constantResponseDecoder,
  createFetchRequestForApi,
  ioResponseDecoder,
  MapResponseType,
  ReplaceRequestParams,
  RequestHeaders,
  TypeofApiParams
} from "italia-ts-commons/lib/requests";
import { Omit } from "italia-ts-commons/lib/types";
import {
  NullableWallet,
  PagoPAErrorResponse,
  PaymentManagerToken,
  PspListResponse
} from "../types/pagopa";
import { SessionResponse } from "../types/pagopa";
import { TransactionListResponse } from "../types/pagopa";
import { TransactionResponse } from "../types/pagopa";
import { WalletListResponse } from "../types/pagopa";
import { WalletResponse } from "../types/pagopa";
import { withBearerToken } from "../utils/request";

import {
  addWalletCreditCardUsingPOSTDecoder,
  AddWalletCreditCardUsingPOSTT,
  checkPaymentUsingGETDefaultDecoder,
  CheckPaymentUsingGETT,
  DeleteBySessionCookieExpiredUsingDELETET,
  DeleteWalletUsingDELETET,
  favouriteWalletUsingPOSTDecoder,
  FavouriteWalletUsingPOSTT,
  getPspListUsingGETDecoder,
  GetPspListUsingGETT,
  getTransactionsUsingGETDecoder,
  GetTransactionsUsingGETT,
  getTransactionUsingGETDecoder,
  GetTransactionUsingGETT,
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

/**
 * A decoder that ignores the content of the payload and only decodes the status
 */
const constantEmptyDecoder = composeResponseDecoders(
  composeResponseDecoders(
    composeResponseDecoders(
      constantResponseDecoder(200, undefined),
      basicErrorResponseDecoder<204>(204)
    ),
    basicErrorResponseDecoder<401>(401)
  ),
  basicErrorResponseDecoder<403>(403)
);

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

type GetTransactionsUsingGETTExtra = MapResponseType<
  GetTransactionsUsingGETT,
  200,
  TransactionListResponse
>;

const ParamAuthorizationBearerHeaderProducer = <
  P extends { readonly Bearer: string }
>(
  p: P
): RequestHeaders<"Authorization"> => {
  return {
    Authorization: `Bearer ${p.Bearer}`
  };
};

const getTransactions: GetTransactionsUsingGETTExtra = {
  method: "get",
  url: () => "/v1/transactions",
  query: () => ({}),
  headers: ParamAuthorizationBearerHeaderProducer,
  response_decoder: getTransactionsUsingGETDecoder(TransactionListResponse)
};

type GetTransactionUsingGETTExtra = MapResponseType<
  GetTransactionUsingGETT,
  200,
  TransactionResponse
>;

const getTransaction: GetTransactionUsingGETTExtra = {
  method: "get",
  url: ({ id }) => `/v1/transactions/${id}`,
  query: () => ({}),
  headers: ParamAuthorizationBearerHeaderProducer,
  response_decoder: getTransactionUsingGETDecoder(TransactionResponse)
};

type GetWalletsUsingGETExtraT = MapResponseType<
  GetWalletsUsingGETT,
  200,
  WalletListResponse
>;

const getWallets: GetWalletsUsingGETExtraT = {
  method: "get",
  url: () => "/v1/wallet",
  query: () => ({}),
  headers: ParamAuthorizationBearerHeaderProducer,
  response_decoder: getWalletsUsingGETDecoder(WalletListResponse)
};

const checkPayment: (
  pagoPaToken: PaymentManagerToken
) => CheckPaymentUsingGETT = pagoPaToken => ({
  method: "get",
  url: ({ id }) => `/v1/payments/${id}/actions/check`,
  query: () => ({}),
  headers: AuthorizationBearerHeaderProducer(pagoPaToken),
  response_decoder: checkPaymentUsingGETDefaultDecoder()
});

type GetPspListUsingGETTExtra = MapResponseType<
  ReplaceRequestParams<
    GetPspListUsingGETT,
    // TODO: temporary patch, see https://www.pivotaltracker.com/story/show/161475199
    TypeofApiParams<GetPspListUsingGETT> & { idWallet?: number }
  >,
  200,
  PspListResponse
>;

const getPspList: (
  pagoPaToken: PaymentManagerToken
) => GetPspListUsingGETTExtra = pagoPaToken => ({
  method: "get",
  url: () => "/v1/psps",
  query: ({ idPayment, idWallet }) =>
    idWallet
      ? {
          paymentType: "CREDIT_CARD",
          idPayment,
          idWallet
        }
      : {
          paymentType: "CREDIT_CARD",
          idPayment
        },
  headers: AuthorizationBearerHeaderProducer(pagoPaToken),
  response_decoder: getPspListUsingGETDecoder(PspListResponse)
});

type UpdateWalletUsingPUTTExtra = MapResponseType<
  UpdateWalletUsingPUTT,
  200,
  WalletResponse
>;

const updateWalletPsp: (
  pagoPaToken: PaymentManagerToken
) => UpdateWalletUsingPUTTExtra = pagoPaToken => ({
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

type FavouriteWalletUsingPOSTTExtra = MapResponseType<
  FavouriteWalletUsingPOSTT,
  200,
  WalletResponse
>;

const favouriteWallet: (
  pagoPaToken: PaymentManagerToken
) => FavouriteWalletUsingPOSTTExtra = pagoPaToken => ({
  method: "post",
  url: ({ id }) => `/v1/wallet/${id}/actions/favourite`,
  query: () => ({}),
  body: () => "",
  headers: composeHeaderProducers(
    AuthorizationBearerHeaderProducer(pagoPaToken),
    ApiHeaderJson
  ),
  response_decoder: favouriteWalletUsingPOSTDecoder(WalletResponse)
});

// Remove this patch once SIA has fixed the spec.
// @see https://www.pivotaltracker.com/story/show/161113136
type AddWalletCreditCardUsingPOSTTExtra = MapResponseType<
  AddResponseType<AddWalletCreditCardUsingPOSTT, 422, PagoPAErrorResponse>,
  200,
  WalletResponse
>;

const addWalletCreditCard: (
  pagoPaToken: PaymentManagerToken
) => AddWalletCreditCardUsingPOSTTExtra = pagoPaToken => ({
  method: "post",
  url: () => "/v1/wallet/cc",
  query: () => ({}),
  body: ({ walletRequest }) => JSON.stringify(walletRequest),
  headers: composeHeaderProducers(
    AuthorizationBearerHeaderProducer(pagoPaToken),
    ApiHeaderJson
  ),
  response_decoder: composeResponseDecoders(
    addWalletCreditCardUsingPOSTDecoder(WalletResponse),
    ioResponseDecoder<422, PagoPAErrorResponse>(422, PagoPAErrorResponse)
  )
});

type PayUsingPOSTTExtra = MapResponseType<
  PayUsingPOSTT,
  200,
  TransactionResponse
>;

const postPayment: (
  pagoPaToken: PaymentManagerToken
) => PayUsingPOSTTExtra = pagoPaToken => ({
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

const deletePayment: (
  pagoPaToken: PaymentManagerToken
) => DeleteBySessionCookieExpiredUsingDELETET = pagoPaToken => ({
  method: "delete",
  url: ({ id }) => `/v1/payments/${id}/actions/delete`,
  query: () => ({}),
  body: () => "",
  headers: composeHeaderProducers(
    AuthorizationBearerHeaderProducer(pagoPaToken),
    ApiHeaderJson
  ),
  response_decoder: constantEmptyDecoder
});

type PayCreditCardVerificationUsingPOSTTExtra = MapResponseType<
  PayCreditCardVerificationUsingPOSTT,
  200,
  TransactionResponse
>;

const boardPay: (
  pagoPaToken: PaymentManagerToken
) => PayCreditCardVerificationUsingPOSTTExtra = pagoPaToken => ({
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
  pagoPaToken: PaymentManagerToken
) => DeleteWalletUsingDELETET = pagoPaToken => ({
  method: "delete",
  url: ({ id }) => `/v1/wallet/${id}`,
  query: () => ({}),
  headers: AuthorizationBearerHeaderProducer(pagoPaToken),
  response_decoder: constantEmptyDecoder
});

const withPaymentManagerToken = <P extends { Bearer: string }, R>(
  f: (p: P) => Promise<R>
) => (token: PaymentManagerToken) => async (
  po: Omit<P, "Bearer">
): Promise<R> => {
  const params = Object.assign({ Bearer: String(token) }, po) as P;
  return f(params);
};

export function PaymentManagerClient(
  baseUrl: string,
  walletToken: string,
  fetchApi: typeof fetch,
  altFetchApi: typeof fetch
) {
  const options = { baseUrl, fetchApi };
  const altOptions = {
    ...options,
    fetchApi: altFetchApi
  };

  return {
    walletToken,
    getSession: (
      wt: string // wallet token
    ) => createFetchRequestForApi(getSession, options)({ token: wt }),
    getWallets: flip(
      withPaymentManagerToken(createFetchRequestForApi(getWallets, options))
    )({}),
    getTransactions: flip(
      withPaymentManagerToken(
        createFetchRequestForApi(getTransactions, options)
      )
    )({}),
    getTransaction: (id: TypeofApiParams<GetTransactionUsingGETT>["id"]) =>
      flip(
        withPaymentManagerToken(
          createFetchRequestForApi(getTransaction, options)
        )
      )({ id }),
    checkPayment: (
      pagoPaToken: PaymentManagerToken,
      id: TypeofApiParams<CheckPaymentUsingGETT>["id"]
    ) =>
      createFetchRequestForApi(checkPayment(pagoPaToken), altOptions)({
        id
      }),
    getPspList: (
      pagoPaToken: PaymentManagerToken,
      idPayment: TypeofApiParams<GetPspListUsingGETTExtra>["idPayment"],
      idWallet?: TypeofApiParams<GetPspListUsingGETTExtra>["idWallet"]
    ) =>
      withBearerToken(
        walletToken,
        createFetchRequestForApi(getPspList(pagoPaToken), options)
      )(
        idWallet
          ? {
              idPayment,
              idWallet
            }
          : { idPayment }
      ),
    updateWalletPsp: (
      pagoPaToken: PaymentManagerToken,
      id: TypeofApiParams<UpdateWalletUsingPUTT>["id"],
      walletRequest: TypeofApiParams<UpdateWalletUsingPUTT>["walletRequest"]
    ) =>
      withBearerToken(
        walletToken,
        createFetchRequestForApi(updateWalletPsp(pagoPaToken), options)
      )({
        id,
        walletRequest
      }),
    favouriteWallet: (
      pagoPaToken: PaymentManagerToken,
      id: TypeofApiParams<FavouriteWalletUsingPOSTTExtra>["id"]
    ) =>
      withBearerToken(
        walletToken,
        createFetchRequestForApi(favouriteWallet(pagoPaToken), options)
      )({
        id
      }),
    postPayment: (
      pagoPaToken: PaymentManagerToken,
      id: TypeofApiParams<PayUsingPOSTT>["id"],
      payRequest: TypeofApiParams<PayUsingPOSTT>["payRequest"]
    ) =>
      withBearerToken(
        walletToken,
        createFetchRequestForApi(postPayment(pagoPaToken), altOptions)
      )({
        id,
        payRequest
      }),
    deletePayment: (
      pagoPaToken: PaymentManagerToken,
      id: TypeofApiParams<DeleteBySessionCookieExpiredUsingDELETET>["id"]
    ) =>
      withBearerToken(
        walletToken,
        createFetchRequestForApi(deletePayment(pagoPaToken), options)
      )({
        id
      }),
    addWalletCreditCard: (
      pagoPaToken: PaymentManagerToken,
      wallet: NullableWallet
    ) =>
      withBearerToken(
        walletToken,
        createFetchRequestForApi(addWalletCreditCard(pagoPaToken), options)
      )({
        walletRequest: { data: wallet }
      }),
    payCreditCardVerification: (
      pagoPaToken: PaymentManagerToken,
      payRequest: TypeofApiParams<
        PayCreditCardVerificationUsingPOSTT
      >["payRequest"],
      language?: TypeofApiParams<
        PayCreditCardVerificationUsingPOSTT
      >["language"]
    ) =>
      withBearerToken(
        walletToken,
        createFetchRequestForApi(boardPay(pagoPaToken), altOptions)
      )({
        payRequest,
        language
      }),
    deleteWallet: (
      pagoPaToken: PaymentManagerToken,
      id: TypeofApiParams<DeleteWalletUsingDELETET>["id"]
    ) =>
      withBearerToken(
        walletToken,
        createFetchRequestForApi(deleteWallet(pagoPaToken), options)
      )({
        id
      })
  };
}

export type PaymentManagerClient = ReturnType<typeof PaymentManagerClient>;
