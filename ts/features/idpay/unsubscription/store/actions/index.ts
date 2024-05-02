import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";

export const idPayUnsubscribeAction = createAsyncAction(
  "IDPAY_UNSUBSCRIBE_REQUEST",
  "IDPAY_UNSUBSCRIBE_SUCCESS",
  "IDPAY_UNSUBSCRIBE_FAILURE",
  "IDPAY_UNSUBSCRIBE_CANCEL"
)<{ initiativeId: string }, undefined, NetworkError, undefined>();

export type IdPayUnsubscriptionActions = ActionType<
  typeof idPayUnsubscribeAction
>;
