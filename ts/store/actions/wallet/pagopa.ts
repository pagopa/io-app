import { Option } from "fp-ts/lib/Option";
import { ActionType, createStandardAction } from "typesafe-actions";

import { PagopaToken } from "../../../types/pagopa";

export const storePagoPaToken = createStandardAction("PAGOPA_STORE_TOKEN")<
  Option<PagopaToken>
>();

export type PagoPaActions = ActionType<typeof storePagoPaToken>;
