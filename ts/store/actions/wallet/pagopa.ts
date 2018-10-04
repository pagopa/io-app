import { Option } from "fp-ts/lib/Option";
import { ActionType, createAction } from "typesafe-actions";

export const storePagoPaToken = createAction(
  "PAGOPA_STORE_TOKEN",
  resolve => (token: Option<string>) => resolve(token)
);

export type PagoPaActions = ActionType<typeof storePagoPaToken>;
