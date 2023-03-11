import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";

export type IdPayUnsubscribePayloadType = { initiativeId: string };

export const idPayUnsubscribe = createAsyncAction(
  "IDPAY_UNSUBSCRIBE_REQUEST",
  "IDPAY_UNSUBSCRIBE_SUCCESS",
  "IDPAY_UNSUBSCRIBE_FAILURE"
)<IdPayUnsubscribePayloadType, void, NetworkError>();

export type IDPayUnsubscriptionActions = ActionType<typeof idPayUnsubscribe>;
