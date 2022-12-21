import { ActionType, createAsyncAction } from "typesafe-actions";
import { TimelineDTO } from "../../../../../../../definitions/idpay/timeline/TimelineDTO";
import { InitiativeDTO } from "../../../../../../../definitions/idpay/wallet/InitiativeDTO";
import { NetworkError } from "../../../../../../utils/errors";

export type IdPayInitiativeGetPayloadType = { initiativeId: string };
export const idpayInitiativeGet = createAsyncAction(
  "IDPAY_INITIATIVE_DETAILS_REQUEST",
  "IDPAY_INITIATIVE_DETAILS_SUCCESS",
  "IDPAY_INITIATIVE_DETAILS_FAILURE"
)<IdPayInitiativeGetPayloadType, InitiativeDTO, NetworkError>();

export const idpayTimelineGet = createAsyncAction(
  "IDPAY_TIMELINE_REQUEST",
  "IDPAY_TIMELINE_SUCCESS",
  "IDPAY_TIMELINE_FAILURE"
)<IdPayInitiativeGetPayloadType, TimelineDTO, NetworkError>();

export type IDPayTimelineActions = ActionType<typeof idpayTimelineGet>;

export type IDPayInitiativeActions =
  | ActionType<typeof idpayInitiativeGet>
  | ActionType<typeof idpayTimelineGet>;
