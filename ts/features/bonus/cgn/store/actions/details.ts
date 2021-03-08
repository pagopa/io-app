import { ActionType, createAsyncAction } from "typesafe-actions";
import { Card } from "../../../../../../definitions/cgn/Card";
import { NetworkError } from "../../../../../utils/errors";

/**
 * get and handle activation state of a CGN
 */
export const cgnDetails = createAsyncAction(
  "CGN_DETAILS_REQUEST",
  "CGN_DETAILS_SUCCESS",
  "CGN_DETAILS_FAILURE"
)<void, Card, NetworkError>();

export type CgnDetailsActions = ActionType<typeof cgnDetails>;
