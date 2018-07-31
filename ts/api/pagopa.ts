import {
  createFetchRequestForApi,
  IGetApiRequestType,
  AuthorizationBearerHeaderProducer
} from "italia-ts-commons/lib/requests";
import { TransactionListResponse, Amount } from "../types/pagopa";
import {
  basicResponseDecoderWith401,
  BasicResponseTypeWith401
} from "./backend";

export const basicResponseDecoderWith401AndCast = <R, T, O = R>(
  type: t.Type<R, O>
): T => basicResponseDecoderWith401(type) as T;

export const PagoPaClient = (token: string) => {
  const tokenHeaderProducer = AuthorizationBearerHeaderProducer(token);

  type GetTransactionsType = IGetApiRequestType<
    {},
    "Authorization",
    never,
    BasicResponseTypeWith401<Amount>
  >;

  const getTransactions: GetTransactionsType = {
    method: "get",
    url: () => "/v1/wallet",
    query: () => ({}),
    headers: tokenHeaderProducer,
    response_decoder: basicResponseDecoderWith401AndCast<Amount>(Amount)
  };

  return {
    getTransactions: createFetchRequestForApi(getTransactions)
    // getWallets: createFetchRequestForApi()
  };
};
