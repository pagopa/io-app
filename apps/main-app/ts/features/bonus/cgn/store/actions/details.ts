import { ActionType, createAsyncAction } from "typesafe-actions";
import { Card } from "../../../../../../definitions/cgn/Card";
import { NetworkError } from "../../../../../utils/errors";

/**
 * get and handle activation state of a CGN
 */
export const cgnDetails = createAsyncAction(
  "CGN_DETAILS_REQUEST",
  "CGN_DETAILS_SUCCESS",
  "CGN_DETAILS_FAILURE",
  "CGN_DETAILS_FAILURE_CANCEL"
)<void, Card, NetworkError, void>();

export type CgnDetailsActions = ActionType<typeof cgnDetails>;
