import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";

// FIXME remove when the correct type has been defined from BE
export type CGNMerchant = unknown;

/**
 * get and handle list of merchants conventioned with CGN
 */
export const cgnMerchants = createAsyncAction(
  "CGN_MERCHANTS_REQUEST",
  "CGN_MERCHANTS_SUCCESS",
  "CGN_MERCHANTS_FAILURE"
)<void, ReadonlyArray<CGNMerchant>, NetworkError>();

export type CgnMerchantsAction = ActionType<typeof cgnMerchants>;
