import { ActionType, createAsyncAction } from "typesafe-actions";
import { InitiativeDTO } from "../../../../../../../definitions/idpay/InitiativeDTO";
import { OperationListDTO } from "../../../../../../../definitions/idpay/OperationListDTO";
import { TimelineDTO } from "../../../../../../../definitions/idpay/TimelineDTO";
import { NetworkError } from "../../../../../../utils/errors";
import { InitiativeDetailDTO } from "../../../../../../../definitions/idpay/InitiativeDetailDTO";

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

export type IdPayBeneficiaryDetailsGetPayloadType = {
  initiativeId: InitiativeDTO["initiativeId"];
};

export const idPayBeneficiaryDetailsGet = createAsyncAction(
  "IDPAY_BENEFICIARY_DETAILS_REQUEST",
  "IDPAY_BENEFICIARY_DETAILS_SUCCESS",
  "IDPAY_BENEFICIARY_DETAILS_FAILURE"
)<IdPayBeneficiaryDetailsGetPayloadType, InitiativeDetailDTO, NetworkError>();

export type IDPayInitiativeActions =
  | ActionType<typeof idpayInitiativeGet>
  | ActionType<typeof idpayTimelinePageGet>
  | ActionType<typeof idPayBeneficiaryDetailsGet>;
