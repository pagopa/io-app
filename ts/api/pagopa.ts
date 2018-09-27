/**
 * pagoPA backend client, with functions
 * to call the different API available
 */
import * as t from "io-ts";
import {
  ApiHeaderJson,
  AuthorizationBearerHeaderProducer,
  basicErrorResponseDecoder,
  composeHeaderProducers,
  composeResponseDecoders,
  createFetchRequestForApi,
  IDeleteApiRequestType,
  IGetApiRequestType,
  ioResponseDecoder,
  IPostApiRequestType,
  IPutApiRequestType,
  IResponseType,
  ResponseDecoder,
  TypeofApiCall
} from "italia-ts-commons/lib/requests";

import { PaymentResponse } from "../../definitions/pagopa/PaymentResponse";
import {
  NullableWallet,
  PayRequest,
  PspListResponse,
  SessionResponse,
  TransactionListResponse,
  TransactionResponse,
  WalletListResponse,
  WalletResponse
} from "../types/pagopa";
import { defaultRetryingFetch } from "../utils/fetch";

export type PaymentManagerErrorType =
  | IResponseType<401, Error>
  | IResponseType<500, Error>;

type BaseResponseType<R> = IResponseType<200, R> | PaymentManagerErrorType;

function baseResponseDecoder<R, O = R>(
  type: t.Type<R, O>
): ResponseDecoder<BaseResponseType<R>> {
  return composeResponseDecoders(
    composeResponseDecoders(
      ioResponseDecoder<200, R, O>(200, type),
      basicErrorResponseDecoder<401>(401)
    ),
    basicErrorResponseDecoder<500>(500)
  );
}

export function emptyResponseDecoder<
  S extends number,
  H extends string = never
>(status: S): ResponseDecoder<IResponseType<S, undefined, H>> {
  return async (response: Response) => {
    if (response.status !== status) {
      return undefined;
    }
    const text = await response.text();
    if (text !== "") {
      return undefined;
    }
    return {
      // tslint:disable-next-line:no-any
      headers: response.headers as any,
      status,
      value: undefined
    };
  };
}

export function emptyResponseDecoderWithErrors(): ResponseDecoder<
  BaseResponseType<undefined> | IResponseType<404, Error>
> {
  return composeResponseDecoders(
    composeResponseDecoders(
      composeResponseDecoders(
        emptyResponseDecoder<200>(200),
        basicErrorResponseDecoder<401>(401)
      ),
      basicErrorResponseDecoder<500>(500)
    ),
    basicErrorResponseDecoder<404>(404)
  );
}

// builds on top of basicResponseDecoderWith401 and
// casts the result to a type T: this is in order to
// work around the fact that io-ts's refinements do
// not produce static types in agreement with the
// dynamic ones
// e.g. this produces an error
// const a: Amount = Amount.decode({ ... }).getOrElse({ ... })
const basicResponseDecoderWith401AndCast = <T>(
  type: any
): ResponseDecoder<BaseResponseType<T>> => baseResponseDecoder(type);

type TokenParamType = Readonly<{
  token: string;
}>;

type GetSessionType = IGetApiRequestType<
  TokenParamType,
  never,
  keyof TokenParamType, // ?token=ABC... using the same name as the param
  BaseResponseType<SessionResponse>
>;

type GetTransactionsType = IGetApiRequestType<
  {},
  "Authorization",
  never,
  BaseResponseType<TransactionListResponse>
>;

type GetWalletsType = IGetApiRequestType<
  {},
  "Authorization",
  never,
  BaseResponseType<WalletListResponse>
>;

type CheckPaymentType = IGetApiRequestType<
  {
    paymentId: string;
  },
  "Authorization",
  never,
  BaseResponseType<PaymentResponse>
>;

type GetPspsListType = IGetApiRequestType<
  {
    paymentId: string;
  },
  "Authorization",
  "idPayment" | "paymentType",
  BaseResponseType<PspListResponse>
>;

type UpdateWalletPspType = IPutApiRequestType<
  {
    walletId: number;
    pspId: number;
  },
  "Content-Type" | "Authorization",
  never,
  BaseResponseType<WalletResponse>
>;

type PostPaymentType = IPostApiRequestType<
  {
    walletId: number;
    paymentId: string;
  },
  "Content-Type" | "Authorization",
  never,
  BaseResponseType<TransactionResponse>
>;

type BoardCreditCardType = IPostApiRequestType<
  { wallet: NullableWallet },
  "Authorization" | "Content-Type",
  never,
  BaseResponseType<WalletResponse>
>;

type BoardPayType = IPostApiRequestType<
  { payRequest: PayRequest },
  "Authorization" | "Content-Type",
  never,
  BaseResponseType<TransactionResponse>
>;

type DeleteWalletType = IDeleteApiRequestType<
  {
    walletId: number;
  },
  "Authorization",
  never,
  BaseResponseType<undefined> | IResponseType<404, Error>
>;

export type PagoPaClient = Readonly<{
  getSession: (
    walletToken: string
  ) => ReturnType<TypeofApiCall<GetSessionType>>;
  getTransactions: (
    pagoPaToken: string
  ) => ReturnType<TypeofApiCall<GetTransactionsType>>;
  getWallets: (
    pagoPaToken: string
  ) => ReturnType<TypeofApiCall<GetWalletsType>>;
  checkPayment: (
    pagoPaToken: string,
    paymentId: string
  ) => ReturnType<TypeofApiCall<CheckPaymentType>>;
  getPspList: (
    pagoPaToken: string,
    paymentId: string
  ) => ReturnType<TypeofApiCall<GetPspsListType>>;
  updateWalletPsp: (
    pagoPaToken: string,
    walletId: number,
    pspId: number
  ) => ReturnType<TypeofApiCall<UpdateWalletPspType>>;
  postPayment: (
    pagoPaToken: string,
    paymentId: string,
    walletId: number
  ) => ReturnType<TypeofApiCall<PostPaymentType>>;
  walletToken: string;
  boardCreditCard: (
    pagoPaToken: string,
    wallet: NullableWallet
  ) => ReturnType<TypeofApiCall<BoardCreditCardType>>;
  boardPay: (
    pagoPaToken: string,
    payRequest: PayRequest
  ) => ReturnType<TypeofApiCall<BoardPayType>>;
  deleteWallet: (
    pagoPaToken: string,
    walletId: number
  ) => ReturnType<TypeofApiCall<DeleteWalletType>>;
}>;

export const PagoPaClient = (
  baseUrl: string,
  walletToken: string,
  fetchApi: typeof fetch = defaultRetryingFetch()
): PagoPaClient => {
  const options = { baseUrl, fetchApi };

  const getSession: GetSessionType = {
    method: "get",
    url: _ => "/v1/users/actions/start-session",
    query: _ => _,
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

  const deleteWallet: (
    pagoPaToken: string
  ) => DeleteWalletType = pagoPaToken => ({
    method: "delete",
    url: ({ walletId }) => `/v1/wallet/${walletId}`,
    query: () => ({}),
    headers: AuthorizationBearerHeaderProducer(pagoPaToken),
    response_decoder: emptyResponseDecoderWithErrors()
  });

  return {
    walletToken,
    getSession: (
      wt: string // wallet token
    ) => createFetchRequestForApi(getSession, options)({ token: wt }),
    getWallets: (pagoPaToken: string) =>
      createFetchRequestForApi(getWallets(pagoPaToken), options)({}),
    getTransactions: (pagoPaToken: string) =>
      createFetchRequestForApi(getTransactions(pagoPaToken), options)({}),
    checkPayment: (pagoPaToken: string, paymentId: string) =>
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
      createFetchRequestForApi(postPayment(pagoPaToken), options)({
        paymentId,
        walletId
      }),
    boardCreditCard: (pagoPaToken: string, wallet: NullableWallet) =>
      createFetchRequestForApi(boardCreditCard(pagoPaToken), options)({
        wallet
      }),
    boardPay: (pagoPaToken: string, payRequest: PayRequest) =>
      createFetchRequestForApi(boardPay(pagoPaToken), options)({
        payRequest
      }),
    deleteWallet: (pagoPaToken: string, walletId: number) =>
      createFetchRequestForApi(deleteWallet(pagoPaToken), options)({
        walletId
      })
  };
};
