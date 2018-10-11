import { ActionType, createStandardAction } from "typesafe-actions";

import { PagopaToken } from "../../../types/pagopa";

export const pagoPaTokenRequest = createStandardAction(
  "PAGOPA_TOKEN_REQUEST"
)();

export const pagoPaTokenFailure = createStandardAction(
  "PAGOPA_TOKEN_FAILURE"
)();

export const pagoPaTokenSuccess = createStandardAction("PAGOPA_TOKEN_SUCCESS")<
  PagopaToken
>();

export type PagoPaActions = ActionType<
  | typeof pagoPaTokenRequest
  | typeof pagoPaTokenFailure
  | typeof pagoPaTokenSuccess
>;
