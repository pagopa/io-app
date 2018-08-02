import { PAGOPA_STORE_TOKEN } from "../constants";

export type StorePagoPaToken = Readonly<{
  type: typeof PAGOPA_STORE_TOKEN;
  payload: string;
}>;

export type PagoPaActions = StorePagoPaToken;

export const storePagoPaToken = (token: string): StorePagoPaToken => ({
  type: PAGOPA_STORE_TOKEN,
  payload: token
});
