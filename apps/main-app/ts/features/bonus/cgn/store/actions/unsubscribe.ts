import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";

/**
 * handle CGN unsubscribe request
 */
export const cgnUnsubscribe = createAsyncAction(
  "CGN_UNSUBSCRIBE_REQUEST",
  "CGN_UNSUBSCRIBE_SUCCESS",
  "CGN_UNSUBSCRIBE_FAILURE"
)<void, void, NetworkError>();

export type CgnUnsubscribeActions = ActionType<typeof cgnUnsubscribe>;
