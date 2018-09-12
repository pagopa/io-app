import { Option } from "fp-ts/lib/Option";
import { PAGOPA_STORE_TOKEN } from "../constants";

type StorePagoPaToken = Readonly<{
  type: typeof PAGOPA_STORE_TOKEN;
  payload: Option<string>;
}>;

export type PagoPaActions = StorePagoPaToken;

export const storePagoPaToken = (token: Option<string>): StorePagoPaToken => ({
  type: PAGOPA_STORE_TOKEN,
  payload: token
});
