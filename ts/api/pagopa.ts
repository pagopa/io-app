/**
 * pagoPA backend client, with functions
 * to call the different API available
 */
import * as r from "@pagopa/ts-commons/lib/requests";
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
} from "@pagopa/ts-commons/lib/requests";
import { Omit } from "@pagopa/ts-commons/lib/types";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as t from "io-ts";
import _ from "lodash";
import {
  addWalletCreditCardUsingPOSTDecoder,
  AddWalletCreditCardUsingPOSTT,
  changePayOptionDecoder,
  checkPaymentUsingGETDefaultDecoder,
  CheckPaymentUsingGETT,
  DeleteBySessionCookieExpiredUsingDELETET,
  deleteWalletsByServiceUsingDELETEDecoder,
  DeleteWalletUsingDELETET,
  favouriteWalletUsingPOSTDecoder,
  FavouriteWalletUsingPOSTT,
  GetAllPspsUsingGETT,
  getPaypalPspsUsingGETDefaultDecoder,
  GetPaypalPspsUsingGETT,
  getPspListUsingGETDecoder,
  GetPspListUsingGETT,
  getPspListV2UsingGETDefaultDecoder,
  GetPspListV2UsingGETT,
  getPspUsingGETDecoder,
  GetPspUsingGETT,
  getTransactionsUsingGETDecoder,
  getTransactionUsingGETDecoder,
  GetTransactionUsingGETT,
  GetWalletsUsingGETT,
  startSessionUsingGETDecoder,
  StartSessionUsingGETT,
  updateWalletUsingPUTV2Decoder,
  UpdateWalletUsingPUTV2T
} from "../../definitions/pagopa/requestTypes";
import { WalletPaymentStatusRequest } from "../../definitions/pagopa/WalletPaymentStatusRequest";
import { BancomatCardsRequest } from "../../definitions/pagopa/walletv2/BancomatCardsRequest";
import { BPayRequest } from "../../definitions/pagopa/walletv2/BPayRequest";
import { CobadegPaymentInstrumentsRequest } from "../../definitions/pagopa/walletv2/CobadegPaymentInstrumentsRequest";
import {
  addWalletsBancomatCardUsingPOSTDecoder,
  addWalletsBPayUsingPOSTDecoder,
  addWalletsCobadgePaymentInstrumentAsCreditCardUsingPOSTDecoder,
  getAbiListUsingGETDefaultDecoder,
  GetAbiListUsingGETT,
  getBpayListUsingGETDefaultDecoder,
  GetBpayListUsingGETT,
  getCobadgeByRequestIdUsingGETDefaultDecoder,
  GetCobadgeByRequestIdUsingGETT,
  getCobadgesUsingGETDefaultDecoder,
  GetCobadgesUsingGETT,
  getPansUsingGETDefaultDecoder,
  GetPansUsingGETT,
  getWalletsV2UsingGETDecoder
} from "../../definitions/pagopa/walletv2/requestTypes";
import {
  NullableWallet,
  PagoPAErrorResponse,
  PatchedDeleteWalletResponse,
  PatchedWalletV2ListResponse,
  PatchedWalletV2Response,
  PaymentManagerToken,
  PspListResponse,
  PspResponse,
  SessionResponse,
  TransactionListResponse,
  TransactionResponse,
  WalletListResponse,
  WalletResponse
} from "../types/pagopa";
import { format } from "../utils/dates";
import { getLocalePrimaryWithFallback } from "../utils/locale";
import { getLookUpId, pmLookupHeaderKey } from "../utils/pmLookUpId";
import { fixWalletPspTagsValues } from "../utils/wallet";

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

const startSessionUsingGETDecoderCustom = startSessionUsingGETDecoder({
  200: SessionResponse
});

const getSession: MapResponseType<StartSessionUsingGETT, 200, SessionResponse> =
  {
    method: "get",
    url: _ => "/v1/users/actions/start-session",
    query: _ => _,
    headers: () => ({}),
    response_decoder: startSessionUsingGETDecoderCustom
  };

// to support 'start' param in query string we re-define the type GetTransactionsUsingGETT
// because the generated one doesn't support 'start' due to weak specs in api definition
export type GetTransactionsUsingGETT = r.IGetApiRequestType<
  { readonly Bearer: string; readonly start: number },
  "Authorization",
  never,
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

const ParamAuthorizationBearerHeader = <
  P extends { readonly Bearer: string; readonly LookUpId?: string }
>(
  p: P
): { Authorization: string; LookUpId?: string } => ({
  Authorization: `Bearer ${p.Bearer}`,
  ...(p.LookUpId ? { [pmLookupHeaderKey]: p.LookUpId } : {})
});

const ParamAuthorizationBearerHeaderProducer =
  <P extends { readonly Bearer: string }>(): RequestHeaderProducer<
    P,
    "Authorization"
  > =>
  (p: P): RequestHeaders<"Authorization"> =>
    ParamAuthorizationBearerHeader(p);

const tokenHeaderProducer = ParamAuthorizationBearerHeaderProducer();
const transactionsSliceLength = 10;
const getTransactionsUsingGETDecoderCustom = getTransactionsUsingGETDecoder({
  200: TransactionListResponse
});
const getTransactions: GetTransactionsUsingGETTExtra = {
  method: "get",
  url: ({ start }) =>
    `/v1/transactions?start=${start}&size=${transactionsSliceLength}`,
  query: () => ({}),
  headers: ParamAuthorizationBearerHeader,
  response_decoder: getTransactionsUsingGETDecoderCustom
};

type GetTransactionUsingGETTExtra = MapResponseType<
  GetTransactionUsingGETT,
  200,
  TransactionResponse
>;

const getTransactionUsingGETDecoderCustom = getTransactionUsingGETDecoder({
  200: TransactionResponse
});

const getTransaction: GetTransactionUsingGETTExtra = {
  method: "get",
  url: ({ id }) => `/v1/transactions/${id}`,
  query: () => ({}),
  headers: ParamAuthorizationBearerHeader,
  response_decoder: getTransactionUsingGETDecoderCustom
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
        r.ioResponseDecoder<200, (typeof type)["_A"], (typeof type)["_O"]>(
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

const getWalletsV2UsingGETDecoderCustom = getWalletsV2UsingGETDecoder({
  200: PatchedWalletV2ListResponse
});
export type GetWalletsV2UsingGETTExtra = r.IGetApiRequestType<
  { readonly Bearer: string },
  "Authorization",
  never,
  | r.IResponseType<200, PatchedWalletV2ListResponse>
  | r.IResponseType<401, undefined>
  | r.IResponseType<403, undefined>
  | r.IResponseType<404, undefined>
>;
const getWalletsV2: GetWalletsV2UsingGETTExtra = {
  method: "get",
  // despite the endpoint is v3, the wallets returned by this API are of type v2
  // v3 is the same of v2 but in addition it includes Paypal ¯\_(ツ)_/¯
  url: () => "/v3/wallet",
  query: () => ({}),
  headers: ParamAuthorizationBearerHeader,
  response_decoder: getWalletsV2UsingGETDecoderCustom
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

const getPspListUsingGETDecoderCustom = getPspListUsingGETDecoder({
  200: PspListResponse
});
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
  response_decoder: getPspListUsingGETDecoderCustom
};

type PspParams = {
  readonly Bearer: string;
  readonly idWallet: string;
  readonly idPayment: string;
  readonly language: string;
};

const getPspQuery = (params: PspParams) => {
  const { idPayment, idWallet, language } = params;
  return {
    idPayment,
    idWallet,
    language
  };
};

type GetAllPspListUsingGETTExtra = MapResponseType<
  GetAllPspsUsingGETT,
  200,
  PspListResponse
>;

const getAllPspList: GetAllPspListUsingGETTExtra = {
  method: "get",
  url: () => "/v1/psps/all",
  query: getPspQuery,
  headers: ParamAuthorizationBearerHeader,
  response_decoder: getPspListUsingGETDecoderCustom
};

type GetPspUsingGETTExtra = MapResponseType<GetPspUsingGETT, 200, PspResponse>;
const getPspUsingGETDecoderCustom = getPspUsingGETDecoder({ 200: PspResponse });
const getPsp: GetPspUsingGETTExtra = {
  method: "get",
  url: ({ id }) => `/v1/psps/${id}`,
  query: () => ({}),
  headers: ParamAuthorizationBearerHeader,
  response_decoder: getPspUsingGETDecoderCustom
};

type UpdateWalletUsingPUTTExtra = MapResponseType<
  UpdateWalletUsingPUTV2T,
  200,
  WalletResponse
>;
const updateWalletUsingPUTV2DecoderCustom = updateWalletUsingPUTV2Decoder({
  200: WalletResponse
});
const updateWalletPsp: UpdateWalletUsingPUTTExtra = {
  method: "put",
  url: ({ id }) => `/v2/wallet/${id}`,
  query: () => ({}),
  body: ({ walletRequest }) => JSON.stringify(walletRequest),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: updateWalletUsingPUTV2DecoderCustom
};

type FavouriteWalletUsingPOSTTExtra = MapResponseType<
  FavouriteWalletUsingPOSTT,
  200,
  WalletResponse
>;

const favouriteWalletUsingPOSTDecoderCustom = favouriteWalletUsingPOSTDecoder({
  200: WalletResponse
});
const favouriteWallet: FavouriteWalletUsingPOSTTExtra = {
  method: "post",
  url: ({ id }) => `/v1/wallet/${id}/actions/favourite`,
  query: () => ({}),
  body: () => "",
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: favouriteWalletUsingPOSTDecoderCustom
};

// Remove this patch once SIA has fixed the spec.
type AddWalletCreditCardUsingPOSTTExtra = MapResponseType<
  AddResponseType<AddWalletCreditCardUsingPOSTT, 422, PagoPAErrorResponse>,
  200,
  WalletResponse
>;

const addWalletCreditCardUsingPOSTDecoderCustom =
  addWalletCreditCardUsingPOSTDecoder({ 200: WalletResponse });
const addWalletCreditCard: AddWalletCreditCardUsingPOSTTExtra = {
  method: "post",
  url: () => "/v1/wallet/cc",
  query: () => ({}),
  body: ({ walletRequest }) => JSON.stringify(walletRequest),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: composeResponseDecoders(
    addWalletCreditCardUsingPOSTDecoderCustom,
    ioResponseDecoder<422, PagoPAErrorResponse>(422, PagoPAErrorResponse)
  )
};

const deletePayment: DeleteBySessionCookieExpiredUsingDELETET = {
  method: "delete",
  url: ({ id }) => `/v1/payments/${id}/actions/delete`,
  query: () => ({}),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: constantEmptyDecoder
};

const deleteWallet: DeleteWalletUsingDELETET = {
  method: "delete",
  url: ({ id }) => `/v1/wallet/${id}`,
  query: () => ({}),
  headers: ParamAuthorizationBearerHeader,
  response_decoder: constantEmptyDecoder
};

const getAbi: GetAbiListUsingGETT = {
  method: "get",
  url: () => `/v1/bancomat/abi?size=10000`, // FIXME needed to retrieve the whole bank list
  query: () => ({}),
  headers: ParamAuthorizationBearerHeader,
  response_decoder: getAbiListUsingGETDefaultDecoder()
};

const getPans: GetPansUsingGETT = {
  method: "get",
  url: ({ abi }) => {
    const abiParameter = pipe(
      abi,
      O.fromNullable,
      O.map(a => `?abi=${a}`),
      O.getOrElse(() => "")
    );
    return `/v1/bancomat/pans${abiParameter}`;
  },
  query: () => ({}),
  headers: ParamAuthorizationBearerHeader,
  response_decoder: getPansUsingGETDefaultDecoder()
};

export type AddWalletsBancomatCardUsingPOSTTExtra = r.IPostApiRequestType<
  {
    readonly Bearer: string;
    readonly bancomatCardsRequest: BancomatCardsRequest;
  },
  "Content-Type" | "Authorization",
  never,
  | r.IResponseType<200, PatchedWalletV2ListResponse>
  | r.IResponseType<201, undefined>
  | r.IResponseType<401, undefined>
  | r.IResponseType<403, undefined>
  | r.IResponseType<404, undefined>
>;

const addWalletsBancomatCardUsingPOSTDecoderCustom =
  addWalletsBancomatCardUsingPOSTDecoder({ 200: PatchedWalletV2ListResponse });
const addPans: AddWalletsBancomatCardUsingPOSTTExtra = {
  method: "post",
  url: () => `/v1/bancomat/add-wallets`,
  query: () => ({}),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  body: p => JSON.stringify(p.bancomatCardsRequest),
  response_decoder: addWalletsBancomatCardUsingPOSTDecoderCustom
};

const searchBPay: GetBpayListUsingGETT = {
  method: "get",
  url: ({ abi }) => {
    const abiParameter = pipe(
      abi,
      O.fromNullable,
      O.map(a => `?abi=${a}`),
      O.getOrElse(() => "")
    );
    return `/v1/bpay/list${abiParameter}`;
  },
  query: () => ({}),
  headers: ParamAuthorizationBearerHeader,
  response_decoder: getBpayListUsingGETDefaultDecoder()
};

const getCobadgePans: GetCobadgesUsingGETT = {
  method: "get",
  url: ({ abiCode }) => {
    const abiParameter = pipe(
      abiCode,
      O.fromNullable,
      O.map(a => `?abiCode=${a}`),
      O.getOrElse(() => "")
    );
    return `/v1/cobadge/pans${abiParameter}`;
  },
  query: () => ({}),
  headers: p => {
    const authBearer = ParamAuthorizationBearerHeader(p);
    return p.PanCode ? { ...authBearer, PanCode: p.PanCode } : authBearer;
  },
  response_decoder: getCobadgesUsingGETDefaultDecoder()
};

const searchCobadgePans: GetCobadgeByRequestIdUsingGETT = {
  method: "get",
  url: ({ searchRequestId }) => `/v1/cobadge/search/${searchRequestId}`,
  query: () => ({}),
  headers: ParamAuthorizationBearerHeader,
  response_decoder: getCobadgeByRequestIdUsingGETDefaultDecoder()
};

export type AddWalletsCobadge = r.IPostApiRequestType<
  {
    readonly Bearer: string;
    readonly cobadegPaymentInstrumentsRequest: CobadegPaymentInstrumentsRequest;
  },
  "Content-Type" | "Authorization",
  never,
  | r.IResponseType<200, PatchedWalletV2ListResponse>
  | r.IResponseType<201, undefined>
  | r.IResponseType<401, undefined>
  | r.IResponseType<403, undefined>
  | r.IResponseType<404, undefined>
>;

const cobadgeInstrumentReplacer = (key: string | number, value: any) => {
  if (key !== "expiringDate") {
    return value;
  }
  const date = new Date(value);
  if (!_.isDate(date)) {
    return value;
  }
  return format(date, "YYYY-MM-DD");
};
const addWalletsCobadgePaymentInstrumentAsCreditCardUsingPOSTDecoderCustom =
  addWalletsCobadgePaymentInstrumentAsCreditCardUsingPOSTDecoder({
    200: PatchedWalletV2ListResponse
  });
const addCobadgeToWallet: AddWalletsCobadge = {
  method: "post",
  url: () => `/v1/cobadge/add-wallets`,
  query: () => ({}),
  body: ({ cobadegPaymentInstrumentsRequest }) =>
    // request payload must have 'expiringDate' field with a specific format
    // see https://www.pivotaltracker.com/story/show/176720702
    JSON.stringify(cobadegPaymentInstrumentsRequest, cobadgeInstrumentReplacer),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder:
    addWalletsCobadgePaymentInstrumentAsCreditCardUsingPOSTDecoderCustom
};

export type AddWalletsBPayUsingPOSTTExtra = r.IPostApiRequestType<
  { readonly Bearer: string; readonly bPayRequest: BPayRequest },
  "Content-Type" | "Authorization",
  never,
  | r.IResponseType<200, PatchedWalletV2ListResponse>
  | r.IResponseType<201, undefined>
  | r.IResponseType<401, undefined>
  | r.IResponseType<403, undefined>
  | r.IResponseType<404, undefined>
>;

const addWalletsBPayUsingPOSTDecoderCustom = addWalletsBPayUsingPOSTDecoder({
  200: PatchedWalletV2ListResponse
});
const addBPayToWallet: AddWalletsBPayUsingPOSTTExtra = {
  method: "post",
  url: () => `/v1/bpay/add-wallets`,
  query: () => ({}),
  body: ({ bPayRequest }) => JSON.stringify(bPayRequest),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: addWalletsBPayUsingPOSTDecoderCustom
};

// Request type definition
export type ChangePayOptionT = r.IPutApiRequestType<
  {
    readonly Bearer: string;
    readonly idWallet: number;
    readonly walletPaymentStatusRequest: WalletPaymentStatusRequest;
  },
  "Content-Type" | "Authorization",
  never,
  | r.IResponseType<200, PatchedWalletV2Response>
  | r.IResponseType<400, undefined>
  | r.IResponseType<404, undefined>
  | r.IResponseType<500, undefined>
>;

const changePayOptionDecoderCustom = changePayOptionDecoder({
  200: PatchedWalletV2Response
});
const updatePaymentStatus: ChangePayOptionT = {
  method: "put",
  url: ({ idWallet }) => `/v2/wallet/${idWallet}/payment-status`,
  query: () => ({}),
  body: ({ walletPaymentStatusRequest }) =>
    JSON.stringify(walletPaymentStatusRequest),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: changePayOptionDecoderCustom
};

export type DeleteWalletsByServiceUsingDELETETExtra = r.IDeleteApiRequestType<
  { readonly Bearer: string; readonly service: string },
  "Authorization",
  never,
  | r.IResponseType<200, PatchedDeleteWalletResponse>
  | r.IResponseType<204, undefined>
  | r.IResponseType<401, undefined>
  | r.IResponseType<403, undefined>
>;

const deleteWalletsByServiceUsingDELETEDecoderCustom =
  deleteWalletsByServiceUsingDELETEDecoder({
    200: PatchedDeleteWalletResponse
  });
const deleteWallets: DeleteWalletsByServiceUsingDELETETExtra = {
  method: "delete",
  url: () => `/v2/wallet/delete-wallets`,
  query: ({ service }) => ({ service }),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: deleteWalletsByServiceUsingDELETEDecoderCustom
};

const searchPayPalPsp: GetPaypalPspsUsingGETT = {
  method: "get",
  url: () => `/v3/paypal/psps`,
  query: params => ({ language: params.language }),
  headers: ParamAuthorizationBearerHeader,
  response_decoder: getPaypalPspsUsingGETDefaultDecoder()
};

const getPspListV2: GetPspListV2UsingGETT = {
  method: "get",
  url: ({ idPayment }) => `/v2/payments/${idPayment}/psps`,
  query: ({ language, idWallet }) => ({ language, idWallet, isList: true }),
  headers: ParamAuthorizationBearerHeader,
  response_decoder: getPspListV2UsingGETDefaultDecoder()
};

const withPaymentManagerToken =
  <P extends { Bearer: string; LookUpId?: string }, R>(
    f: (p: P) => Promise<R>
  ) =>
  (token: PaymentManagerToken) =>
  async (po: Omit<P, "Bearer">): Promise<R> => {
    const params = Object.assign(
      { Bearer: String(token), LookUpId: getLookUpId() },
      po
    ) as P;
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
    getWallets: pipe(
      createFetchRequestForApi(getWallets, options),
      withPaymentManagerToken,
      fn => (token: PaymentManagerToken) => fn(token)({})
    ),
    getWalletsV2: pipe(
      createFetchRequestForApi(getWalletsV2, options),
      withPaymentManagerToken,
      fn => (token: PaymentManagerToken) => fn(token)({})
    ),
    // (a: A) => (b: B) => C
    getTransactions: (start: number) =>
      pipe(
        createFetchRequestForApi(getTransactions, options),
        withPaymentManagerToken,
        fn => (token: PaymentManagerToken) => fn(token)({ start })
      ),
    getTransaction: (id: TypeofApiParams<GetTransactionUsingGETT>["id"]) =>
      pipe(
        createFetchRequestForApi(getTransaction, options),
        withPaymentManagerToken,
        fn => (token: PaymentManagerToken) => fn(token)({ id })
      ),
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
      pipe(
        createFetchRequestForApi(getPspList, options),
        withPaymentManagerToken,
        fn => (token: PaymentManagerToken) =>
          fn(token)(
            idWallet
              ? {
                  idPayment,
                  idWallet,
                  language: getLocalePrimaryWithFallback()
                }
              : { idPayment, language: getLocalePrimaryWithFallback() }
          )
      ),
    getAllPspList: (
      idPayment: TypeofApiParams<GetAllPspsUsingGETT>["idPayment"],
      idWallet: TypeofApiParams<GetAllPspsUsingGETT>["idWallet"]
    ) =>
      pipe(
        createFetchRequestForApi(getAllPspList, options),
        withPaymentManagerToken,
        fn => (token: PaymentManagerToken) =>
          fn(token)({
            idPayment,
            idWallet,
            language: getLocalePrimaryWithFallback()
          })
      ),
    getPsp: (id: TypeofApiParams<GetPspUsingGETT>["id"]) =>
      pipe(
        createFetchRequestForApi(getPsp, options),
        withPaymentManagerToken,
        fn => (token: PaymentManagerToken) =>
          fn(token)({
            id
          })
      ),
    updateWalletPsp: (
      id: TypeofApiParams<UpdateWalletUsingPUTV2T>["id"],
      walletRequest: TypeofApiParams<UpdateWalletUsingPUTV2T>["walletRequest"]
    ) =>
      pipe(
        createFetchRequestForApi(updateWalletPsp, options),
        withPaymentManagerToken,
        fn => (token: PaymentManagerToken) =>
          fn(token)({
            id,
            walletRequest
          })
      ),
    favouriteWallet: (
      id: TypeofApiParams<FavouriteWalletUsingPOSTTExtra>["id"]
    ) =>
      pipe(
        createFetchRequestForApi(favouriteWallet, options),
        withPaymentManagerToken,
        // eslint-disable-next-line sonarjs/no-identical-functions
        fn => (token: PaymentManagerToken) =>
          fn(token)({
            id
          })
      ),
    deletePayment: (
      id: TypeofApiParams<DeleteBySessionCookieExpiredUsingDELETET>["id"]
    ) =>
      pipe(
        createFetchRequestForApi(deletePayment, options),
        withPaymentManagerToken,
        // eslint-disable-next-line sonarjs/no-identical-functions
        fn => (token: PaymentManagerToken) =>
          fn(token)({
            id
          })
      ),
    addWalletCreditCard: (wallet: NullableWallet) =>
      pipe(
        createFetchRequestForApi(addWalletCreditCard, options),
        withPaymentManagerToken,
        fn => (token: PaymentManagerToken) =>
          fn(token)({
            walletRequest: { data: wallet }
          })
      ),
    deleteWallet: (id: TypeofApiParams<DeleteWalletUsingDELETET>["id"]) =>
      pipe(
        createFetchRequestForApi(deleteWallet, options),
        withPaymentManagerToken,
        // eslint-disable-next-line sonarjs/no-identical-functions
        fn => (token: PaymentManagerToken) =>
          fn(token)({
            id
          })
      ),
    getAbi: pipe(
      createFetchRequestForApi(getAbi, options),
      withPaymentManagerToken,
      fn => (token: PaymentManagerToken) => fn(token)({})
    ),
    getPans: (abi?: string) =>
      pipe(
        createFetchRequestForApi(getPans, options),
        withPaymentManagerToken,
        fn => (token: PaymentManagerToken) => fn(token)({ abi })
      ),
    addPans: (cards: BancomatCardsRequest) =>
      pipe(
        createFetchRequestForApi(addPans, options),
        withPaymentManagerToken,
        fn => (token: PaymentManagerToken) =>
          fn(token)({ bancomatCardsRequest: cards })
      ),
    searchBPay: (abi?: string) =>
      pipe(
        createFetchRequestForApi(searchBPay, altOptions),
        withPaymentManagerToken,
        fn => (token: PaymentManagerToken) => fn(token)({ abi })
      ),
    addBPayToWallet: (bPayRequest: BPayRequest) =>
      pipe(
        createFetchRequestForApi(addBPayToWallet, altOptions),
        withPaymentManagerToken,
        fn => (token: PaymentManagerToken) => fn(token)({ bPayRequest })
      ),
    getCobadgePans: (abiCode: string | undefined, panCode?: string) =>
      pipe(
        createFetchRequestForApi(getCobadgePans, altOptions),
        withPaymentManagerToken,
        fn => (token: PaymentManagerToken) =>
          fn(token)({ abiCode, PanCode: panCode })
      ),
    searchCobadgePans: (searchRequestId: string) =>
      pipe(
        createFetchRequestForApi(searchCobadgePans, altOptions),
        withPaymentManagerToken,
        fn => (token: PaymentManagerToken) => fn(token)({ searchRequestId })
      ),
    addCobadgeToWallet: (
      cobadegPaymentInstrumentsRequest: CobadegPaymentInstrumentsRequest
    ) =>
      pipe(
        createFetchRequestForApi(addCobadgeToWallet, altOptions),
        withPaymentManagerToken,
        fn => (token: PaymentManagerToken) =>
          fn(token)({ cobadegPaymentInstrumentsRequest })
      ),
    updatePaymentStatus: (payload: {
      idWallet: number;
      paymentEnabled: boolean;
    }) =>
      pipe(
        createFetchRequestForApi(updatePaymentStatus, altOptions),
        withPaymentManagerToken,
        fn => (token: PaymentManagerToken) =>
          fn(token)({
            idWallet: payload.idWallet,
            walletPaymentStatusRequest: {
              data: { pagoPA: payload.paymentEnabled }
            }
          })
      ),
    deleteAllPaymentMethodsByFunction: (service: string) =>
      pipe(
        createFetchRequestForApi(deleteWallets, altOptions),
        withPaymentManagerToken,
        fn => (token: PaymentManagerToken) =>
          fn(token)({
            service
          })
      ),
    searchPayPalPsp: pipe(
      createFetchRequestForApi(searchPayPalPsp, options),
      withPaymentManagerToken,
      fn => (token: PaymentManagerToken) =>
        fn(token)({
          language: getLocalePrimaryWithFallback()
        })
    ),
    getPspV2: (payload: { idWallet: number; idPayment: string }) =>
      pipe(
        createFetchRequestForApi(getPspListV2, options),
        withPaymentManagerToken,
        fn => (token: PaymentManagerToken) =>
          fn(token)({
            language: getLocalePrimaryWithFallback(),
            idWallet: payload.idWallet.toString(),
            idPayment: payload.idPayment
          })
      )
  };
}

export type PaymentManagerClient = ReturnType<typeof PaymentManagerClient>;
