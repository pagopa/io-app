import { ActionType, createAsyncAction } from "typesafe-actions";
import { OperationDTO } from "../../../../../../../definitions/idpay/timeline/OperationDTO";
import { OperationListDTO } from "../../../../../../../definitions/idpay/timeline/OperationListDTO";
import { TimelineDTO } from "../../../../../../../definitions/idpay/timeline/TimelineDTO";
import { InitiativeDTO } from "../../../../../../../definitions/idpay/wallet/InitiativeDTO";
import { NetworkError } from "../../../../../../utils/errors";

export type IdPayInitiativeGetPayloadType = { initiativeId: string };

export const idpayInitiativeGet = createAsyncAction(
  "IDPAY_INITIATIVE_DETAILS_REQUEST",
  "IDPAY_INITIATIVE_DETAILS_SUCCESS",
  "IDPAY_INITIATIVE_DETAILS_FAILURE"
)<IdPayInitiativeGetPayloadType, InitiativeDTO, NetworkError>();

export type IdpayTimelinePageGetPayloadType = {
  initiativeId: string;
  page?: number;
  pageSize?: number;
};

type IdPayTimelinePageGetSuccessPayloadType = {
  timeline: TimelineDTO;
  page: number;
};

export const idpayTimelinePageGet = createAsyncAction(
  "IDPAY_TIMELINE_PAGE_REQUEST",
  "IDPAY_TIMELINE_PAGE_SUCCESS",
  "IDPAY_TIMELINE_PAGE_FAILURE"
)<
  IdpayTimelinePageGetPayloadType,
  IdPayTimelinePageGetSuccessPayloadType,
  NetworkError
>();

export type IdPayTimelineDetailsGetPayloadType = {
  initiativeId: InitiativeDTO["initiativeId"];
  operationId: OperationListDTO["operationId"];
};

export const idpayTimelineDetailsGet = createAsyncAction(
  "IDPAY_TIMELINE_DETAILS_REQUEST",
  "IDPAY_TIMELINE_DETAILS_SUCCESS",
  "IDPAY_TIMELINE_DETAILS_FAILURE"
)<IdPayTimelineDetailsGetPayloadType, OperationDTO, NetworkError>();

export type IDPayInitiativeActions =
  | ActionType<typeof idpayInitiativeGet>
  | ActionType<typeof idpayTimelinePageGet>
  | ActionType<typeof idpayTimelineDetailsGet>;
