/**
 * pagoPA backend client, with functions
 * to call the different API available
 */
import {
  AuthorizationBearerHeaderProducer,
  createFetchRequestForApi,
  IGetApiRequestType,
  ResponseDecoder,
  RequestHeaderProducer
} from "italia-ts-commons/lib/requests";
import {
  TransactionListResponse,
  WalletListResponse,
  Session
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
  BasicResponseTypeWith401<Session>
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

// export type PagoPaClient = Readonly<{
//   getSession: (
//     params: TokenParamType
//   ) => Promise<BasicResponseTypeWith401<Session> | undefined>;
//   getTransactions: (
//     params: {}
//   ) => Promise<BasicResponseTypeWith401<TransactionListResponse> | undefined>;
//   getWallets: (
//     parmas: {}
//   ) => Promise<BasicResponseTypeWith401<WalletListResponse> | undefined>;
//   walletToken: Readonly<string>;
//   // getSession: (params: { token: string })
//   pagoPaToken: string; // this will be overwritten when needed (i.e. the session expires)
// }>;

export class PagoPaClient {
  private readonly options: {
    readonly baseUrl?: string;
    readonly fetchApi?: typeof fetch;
  };
  private readonly walletToken: string; // backend token
  private pagoPaToken: string; // this is the pagoPA token, might require refreshing
  private tokenHeaderProducer: RequestHeaderProducer<{}, "Authorization">;

  public constructor(
    baseUrl: string,
    token: string,
    fetchApi: typeof fetch = defaultRetryingFetch()
  ) {
    this.options = { baseUrl, fetchApi };
    this.walletToken = token;
    this.pagoPaToken = ""; // initially empty
    this.tokenHeaderProducer = AuthorizationBearerHeaderProducer(
      this.pagoPaToken
    );
  }

  // returns a boolean (true => success, false => error)
  // this function hides the token-refreshing mechanism
  // from the caller
  public async refreshPagoPaSession(): Promise<boolean> {
    const getSessionT: GetSessionType = {
      method: "get",
      url: _ => "/v1/users/actions/start-session",
      query: t => t,
      headers: () => ({}),
      response_decoder: basicResponseDecoderWith401AndCast<Session>(Session)
    };
    const response = await createFetchRequestForApi(getSessionT, this.options)({
      token: this.walletToken
    });
    if (response !== undefined && response.status === 200) {
      // success!
      this.pagoPaToken = response.value.sessionToken;
      this.tokenHeaderProducer = AuthorizationBearerHeaderProducer(
        this.pagoPaToken
      );
      return true;
    }
    return false; // some problem came up -- fail
  }

  public getTransactions(): Promise<
    BasicResponseTypeWith401<TransactionListResponse> | undefined
  > {
    const getTransactionsT: GetTransactionsType = {
      method: "get",
      url: () => "/v1/transactions",
      query: () => ({}),
      headers: this.tokenHeaderProducer,
      response_decoder: basicResponseDecoderWith401AndCast<
        TransactionListResponse
      >(TransactionListResponse)
    };
    return createFetchRequestForApi(getTransactionsT, this.options)({});
  }

  public getWallets(): Promise<
    BasicResponseTypeWith401<WalletListResponse> | undefined
  > {
    const getWalletsT: GetWalletsType = {
      method: "get",
      url: () => "/v1/wallet",
      query: () => ({}),
      headers: this.tokenHeaderProducer,
      response_decoder: basicResponseDecoderWith401AndCast<WalletListResponse>(
        WalletListResponse
      )
    };
    return createFetchRequestForApi(getWalletsT, this.options)({});
  }
}

/*
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

  const getSession: GetSessionType = {
    method: "get",
    url: _ => "/v1/users/actions/start-session",
    query: t => t,
    headers: () => ({}),
    response_decoder: basicResponseDecoderWith401AndCast<Session>(Session)
  };

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

  const x = createFetchRequestForApi(getSession, options);

  return {
    getSession: createFetchRequestForApi(getSession, options),
    getTransactions: createFetchRequestForApi(getTransactions, options),
    getWallets: createFetchRequestForApi(getWallets, options),
    walletToken: "",
    pagoPaToken: ""
  };
};
*/
