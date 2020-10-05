/**
 * pagoPA backend client, with functions
 * to call the different API available
 */
import { flip } from "fp-ts/lib/function";

import * as t from "io-ts";
import * as r from "italia-ts-commons/lib/requests";
import {
  AddResponseType,
  ApiHeaderJson,
  composeHeaderProducers,
  composeResponseDecoders,
  constantResponseDecoder,
  createFetchRequestForApi,
  ioResponseDecoder,
  MapResponseType,
  ReplaceRequestParams,
  RequestHeaderProducer,
  RequestHeaders,
  TypeofApiParams
} from "italia-ts-commons/lib/requests";
import { Omit, replaceProp1 as repP } from "italia-ts-commons/lib/types";
import {
  addWalletCreditCardUsingPOSTDecoder,
  AddWalletCreditCardUsingPOSTT,
  checkPaymentUsingGETDefaultDecoder,
  CheckPaymentUsingGETT,
  DeleteBySessionCookieExpiredUsingDELETET,
  DeleteWalletUsingDELETET,
  favouriteWalletUsingPOSTDecoder,
  FavouriteWalletUsingPOSTT,
  GetAllPspsUsingGETT,
  getPspListUsingGETDecoder,
  GetPspListUsingGETT,
  getPspUsingGETDecoder,
  GetPspUsingGETT,
  getTransactionsUsingGETDecoder,
  getTransactionUsingGETDecoder,
  GetTransactionUsingGETT,
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
import {
  NullableWallet,
  PagoPAErrorResponse,
  PaymentManagerToken,
  PspListResponse,
  PspResponse,
  SessionResponse,
  TransactionListResponse,
  TransactionResponse,
  WalletListResponse,
  WalletResponse
} from "../types/pagopa";
import { getLocalePrimaryWithFallback } from "../utils/locale";
import { fixWalletPspTagsValues } from "../utils/wallet";
import {
  getAbiUsingGetDefaultDecoder,
  GetAbiUsingGetT,
  getPansUsingGetDecoder,
  GetPansUsingGetT
} from "../../definitions/pagopa/bancomat/requestTypes";
import { Card } from "../../definitions/pagopa/bancomat/Card";

/**
 * A decoder that ignores the content of the payload and only decodes the status
 */
const constantEmptyDecoder = composeResponseDecoders(
  composeResponseDecoders(
    composeResponseDecoders(
      constantResponseDecoder(200, undefined),
      constantResponseDecoder<undefined, 204>(204, undefined)
    ),
    constantResponseDecoder<undefined, 401>(401, undefined)
  ),
  constantResponseDecoder<undefined, 403>(403, undefined)
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

// to support 'start' param in query string we re-define the type GetTransactionsUsingGETT
// because the generated one doesn't support 'start' due to weak specs in api definition
export type GetTransactionsUsingGETT = r.IGetApiRequestType<
  { readonly Bearer: string; readonly start: number },
  "Authorization",
  never,
  // eslint-disable-next-line
  | r.IResponseType<200, TransactionListResponse>
  | r.IResponseType<401, undefined>
  | r.IResponseType<403, undefined>
  | r.IResponseType<404, undefined>
>;

type GetTransactionsUsingGETTExtra = MapResponseType<
  GetTransactionsUsingGETT,
  200,
  TransactionListResponse
>;

const ParamAuthorizationBearerHeader = <P extends { readonly Bearer: string }>(
  p: P
): RequestHeaders<"Authorization"> => ({
  Authorization: `Bearer ${p.Bearer}`
});

const ParamAuthorizationBearerHeaderProducer = <
  P extends { readonly Bearer: string }
>(): RequestHeaderProducer<P, "Authorization"> => (
  p: P
): RequestHeaders<"Authorization"> => ParamAuthorizationBearerHeader(p);

const tokenHeaderProducer = ParamAuthorizationBearerHeaderProducer();
const transactionsSliceLength = 10;
const getTransactions: GetTransactionsUsingGETTExtra = {
  method: "get",
  url: ({ start }) =>
    `/v1/transactions?start=${start}&size=${transactionsSliceLength}`,
  query: () => ({}),
  headers: ParamAuthorizationBearerHeader,
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
  headers: ParamAuthorizationBearerHeader,
  response_decoder: getTransactionUsingGETDecoder(TransactionResponse)
};

type GetWalletsUsingGETExtraT = MapResponseType<
  GetWalletsUsingGETT,
  200,
  WalletListResponse
>;

/**
 *
 * This patch is needed because 'tags' field (an array of strings) in psp objects
 * often contains mixed (and duplicated too) values
 * e.g tags = ["value1",null,null]
 * Psp codec fails decoding 'tags' having these values, so this getPatchedWalletsUsingGETDecoder alterates the
 * payload just before the decoding phase making 'tags' an empty array
 * TODO: temporary patch. Remove this patch once SIA has fixed the spec.
 * @see https://www.pivotaltracker.com/story/show/166665367
 */
const getPatchedWalletsUsingGETDecoder = <O>(
  type: t.Type<WalletListResponse, O>
) =>
  r.composeResponseDecoders(
    r.composeResponseDecoders(
      r.composeResponseDecoders(
        r.ioResponseDecoder<200, typeof type["_A"], typeof type["_O"]>(
          200,
          type,
          payload => {
            if (payload && payload.data && Array.isArray(payload.data)) {
              // sanitize wallets from values with type different
              // from string contained in psp.tags arrays
              const newData = payload.data.map((w: any) =>
                fixWalletPspTagsValues(w)
              );
              return { ...payload, data: newData };
            }
            return payload;
          }
        ),
        r.constantResponseDecoder<undefined, 401>(401, undefined)
      ),
      r.constantResponseDecoder<undefined, 403>(403, undefined)
    ),
    r.constantResponseDecoder<undefined, 404>(404, undefined)
  );

const getWallets: GetWalletsUsingGETExtraT = {
  method: "get",
  url: () => "/v1/wallet",
  query: () => ({}),
  headers: ParamAuthorizationBearerHeader,
  response_decoder: getPatchedWalletsUsingGETDecoder(WalletListResponse)
};

const checkPayment: CheckPaymentUsingGETT = {
  method: "get",
  url: ({ id }) => `/v1/payments/${id}/actions/check`,
  query: () => ({}),
  headers: ParamAuthorizationBearerHeaderProducer,
  response_decoder: checkPaymentUsingGETDefaultDecoder()
};

type GetPspListUsingGETTExtra = MapResponseType<
  ReplaceRequestParams<
    GetPspListUsingGETT,
    // TODO: temporary patch, see https://www.pivotaltracker.com/story/show/161475199
    TypeofApiParams<GetPspListUsingGETT> & {
      idWallet?: number;
      language?: string;
    }
  >,
  200,
  PspListResponse
>;

const getPspList: GetPspListUsingGETTExtra = {
  method: "get",
  url: () => "/v1/psps",
  query: ({ idPayment, idWallet, language }) =>
    idWallet
      ? {
          paymentType: "CREDIT_CARD",
          idPayment,
          idWallet,
          language
        }
      : {
          paymentType: "CREDIT_CARD",
          idPayment,
          language
        },
  headers: ParamAuthorizationBearerHeader,
  response_decoder: getPspListUsingGETDecoder(PspListResponse)
};

type GetAllPspListUsingGETTExtra = MapResponseType<
  GetAllPspsUsingGETT,
  200,
  PspListResponse
>;

const getAllPspList: GetAllPspListUsingGETTExtra = {
  method: "get",
  url: () => "/v1/psps/all",
  query: ({ idPayment, idWallet, language }) => ({
    idPayment,
    idWallet,
    language
  }),
  headers: ParamAuthorizationBearerHeader,
  response_decoder: getPspListUsingGETDecoder(PspListResponse)
};

type GetPspUsingGETTExtra = MapResponseType<GetPspUsingGETT, 200, PspResponse>;

const getPsp: GetPspUsingGETTExtra = {
  method: "get",
  url: ({ id }) => `/v1/psps/${id}`,
  query: () => ({}),
  headers: ParamAuthorizationBearerHeader,
  response_decoder: getPspUsingGETDecoder(PspResponse)
};

type UpdateWalletUsingPUTTExtra = MapResponseType<
  UpdateWalletUsingPUTT,
  200,
  WalletResponse
>;

const updateWalletPsp: UpdateWalletUsingPUTTExtra = {
  method: "put",
  url: ({ id }) => `/v1/wallet/${id}`,
  query: () => ({}),
  body: ({ walletRequest }) => JSON.stringify(walletRequest),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: updateWalletUsingPUTDecoder(WalletResponse)
};

type FavouriteWalletUsingPOSTTExtra = MapResponseType<
  FavouriteWalletUsingPOSTT,
  200,
  WalletResponse
>;

const favouriteWallet: FavouriteWalletUsingPOSTTExtra = {
  method: "post",
  url: ({ id }) => `/v1/wallet/${id}/actions/favourite`,
  query: () => ({}),
  body: () => "",
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: favouriteWalletUsingPOSTDecoder(WalletResponse)
};

// Remove this patch once SIA has fixed the spec.
// @see https://www.pivotaltracker.com/story/show/161113136
type AddWalletCreditCardUsingPOSTTExtra = MapResponseType<
  AddResponseType<AddWalletCreditCardUsingPOSTT, 422, PagoPAErrorResponse>,
  200,
  WalletResponse
>;

const addWalletCreditCard: AddWalletCreditCardUsingPOSTTExtra = {
  method: "post",
  url: () => "/v1/wallet/cc",
  query: () => ({}),
  body: ({ walletRequest }) => JSON.stringify(walletRequest),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: composeResponseDecoders(
    addWalletCreditCardUsingPOSTDecoder(WalletResponse),
    ioResponseDecoder<422, PagoPAErrorResponse>(422, PagoPAErrorResponse)
  )
};

type PayUsingPOSTTExtra = MapResponseType<
  PayUsingPOSTT,
  200,
  TransactionResponse
>;

const postPayment: PayUsingPOSTTExtra = {
  method: "post",
  url: ({ id }) => `/v1/payments/${id}/actions/pay`,
  query: () => ({}),
  body: ({ payRequest }) => JSON.stringify(payRequest),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: payUsingPOSTDecoder(TransactionResponse)
};

const deletePayment: DeleteBySessionCookieExpiredUsingDELETET = {
  method: "delete",
  url: ({ id }) => `/v1/payments/${id}/actions/delete`,
  query: () => ({}),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: constantEmptyDecoder
};

type PayCreditCardVerificationUsingPOSTTExtra = MapResponseType<
  PayCreditCardVerificationUsingPOSTT,
  200,
  TransactionResponse
>;

const boardPay: PayCreditCardVerificationUsingPOSTTExtra = {
  method: "post",
  url: () => "/v1/payments/cc/actions/pay",
  query: () => ({}),
  body: ({ payRequest }) => JSON.stringify(payRequest),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: payCreditCardVerificationUsingPOSTDecoder(
    TransactionResponse
  )
};

const deleteWallet: DeleteWalletUsingDELETET = {
  method: "delete",
  url: ({ id }) => `/v1/wallet/${id}`,
  query: () => ({}),
  headers: ParamAuthorizationBearerHeader,
  response_decoder: constantEmptyDecoder
};

const getAbi: GetAbiUsingGetT = {
  method: "get",
  url: () => `/v1/bancomat/abi`,
  query: () => ({}),
  headers: ParamAuthorizationBearerHeader,
  response_decoder: getAbiUsingGetDefaultDecoder()
};

// TODO move this type to patched types folder/file
// expiringDate codec is created as PatternString instead of DateFromString
export const PatchedCard = repP(Card, "expiringDate", t.string);
export type PatchedCard = t.TypeOf<typeof PatchedCard>;
const PatchedCards = t.partial({
  data: t.readonlyArray(PatchedCard, "array of PatchedCard")
});
export type PatchedCards = t.TypeOf<typeof PatchedCards>;

type GetPansUsingGetTExtra = MapResponseType<
  GetPansUsingGetT,
  200,
  PatchedCards
>;

const getPans: GetPansUsingGetTExtra = {
  method: "get",
  url: () => `/v1/bancomat/pans`,
  query: ({ abi }) => ({ abi }),
  headers: ParamAuthorizationBearerHeader,
  response_decoder: getPansUsingGetDecoder(PatchedCards)
};

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
    getTransactions: (start: number) =>
      flip(
        withPaymentManagerToken(
          createFetchRequestForApi(getTransactions, options)
        )
      )({ start }),
    getTransaction: (id: TypeofApiParams<GetTransactionUsingGETT>["id"]) =>
      flip(
        withPaymentManagerToken(
          createFetchRequestForApi(getTransaction, options)
        )
      )({ id }),
    checkPayment: (id: TypeofApiParams<CheckPaymentUsingGETT>["id"]) =>
      createFetchRequestForApi(
        checkPayment,
        altOptions
      )({
        id
      }),
    getPspList: (
      idPayment: TypeofApiParams<GetPspListUsingGETTExtra>["idPayment"],
      idWallet?: TypeofApiParams<GetPspListUsingGETTExtra>["idWallet"]
    ) =>
      flip(
        withPaymentManagerToken(createFetchRequestForApi(getPspList, options))
      )(
        idWallet
          ? {
              idPayment,
              idWallet,
              language: getLocalePrimaryWithFallback()
            }
          : { idPayment, language: getLocalePrimaryWithFallback() }
      ),
    getAllPspList: (
      idPayment: TypeofApiParams<GetAllPspsUsingGETT>["idPayment"],
      idWallet: TypeofApiParams<GetAllPspsUsingGETT>["idWallet"]
    ) =>
      flip(
        withPaymentManagerToken(
          createFetchRequestForApi(getAllPspList, options)
        )
      )({
        idPayment,
        idWallet,
        language: getLocalePrimaryWithFallback()
      }),
    getPsp: (id: TypeofApiParams<GetPspUsingGETT>["id"]) =>
      flip(withPaymentManagerToken(createFetchRequestForApi(getPsp, options)))({
        id
      }),
    updateWalletPsp: (
      id: TypeofApiParams<UpdateWalletUsingPUTT>["id"],
      walletRequest: TypeofApiParams<UpdateWalletUsingPUTT>["walletRequest"]
    ) =>
      flip(
        withPaymentManagerToken(
          createFetchRequestForApi(updateWalletPsp, options)
        )
      )({
        id,
        walletRequest
      }),
    favouriteWallet: (
      id: TypeofApiParams<FavouriteWalletUsingPOSTTExtra>["id"]
    ) =>
      flip(
        withPaymentManagerToken(
          createFetchRequestForApi(favouriteWallet, options)
        )
      )({
        id
      }),
    postPayment: (
      id: TypeofApiParams<PayUsingPOSTT>["id"],
      payRequest: TypeofApiParams<PayUsingPOSTT>["payRequest"]
    ) =>
      flip(
        withPaymentManagerToken(
          createFetchRequestForApi(postPayment, altOptions)
        )
      )({
        id,
        payRequest
      }),
    deletePayment: (
      id: TypeofApiParams<DeleteBySessionCookieExpiredUsingDELETET>["id"]
    ) =>
      flip(
        withPaymentManagerToken(
          createFetchRequestForApi(deletePayment, options)
        )
      )({
        id
      }),
    addWalletCreditCard: (wallet: NullableWallet) =>
      flip(
        withPaymentManagerToken(
          createFetchRequestForApi(addWalletCreditCard, options)
        )
      )({
        walletRequest: { data: wallet }
      }),
    payCreditCardVerification: (
      payRequest: TypeofApiParams<
        PayCreditCardVerificationUsingPOSTT
      >["payRequest"],
      language?: TypeofApiParams<
        PayCreditCardVerificationUsingPOSTT
      >["language"]
    ) =>
      flip(
        withPaymentManagerToken(createFetchRequestForApi(boardPay, altOptions))
      )({
        payRequest,
        language
      }),
    deleteWallet: (id: TypeofApiParams<DeleteWalletUsingDELETET>["id"]) =>
      flip(
        withPaymentManagerToken(createFetchRequestForApi(deleteWallet, options))
      )({
        id
      }),
    getAbi: flip(
      withPaymentManagerToken(createFetchRequestForApi(getAbi, altOptions))
    )({}),
    getPans: (abi?: string) =>
      flip(
        withPaymentManagerToken(createFetchRequestForApi(getPans, altOptions))
      )(
        // empty abi if it's undefined
        { abi: abi || "" }
      )
  };
}

export type PaymentManagerClient = ReturnType<typeof PaymentManagerClient>;
