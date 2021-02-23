import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";

/**
 * get and handle list of merchants conventioned with CGN
 */
export const cgnMerchants = createAsyncAction(
  "CGN_MERCHANTS_REQUEST",
  "CGN_MERCHANTS_SUCCESS",
  "CGN_MERCHANTS_FAILURE"
)<void, ReadonlyArray<any>, NetworkError>();

export type CgnMerchantsAction = ActionType<typeof cgnMerchants>;
