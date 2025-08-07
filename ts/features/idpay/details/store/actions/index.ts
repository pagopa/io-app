import { ActionType, createAsyncAction } from "typesafe-actions";
import { InitiativeDTO1 } from "../../../../../../definitions/idpay/InitiativeDTO1";
import { OperationListDTO } from "../../../../../../definitions/idpay/OperationListDTO";
import { TimelineDTO } from "../../../../../../definitions/idpay/TimelineDTO";
import { NetworkError } from "../../../../../utils/errors";
import { InitiativeDetailDTO } from "../../../../../../definitions/idpay/InitiativeDetailDTO";
import { OnboardingStatusDTO } from "../../../../../../definitions/idpay/OnboardingStatusDTO";

export type IdPayInitiativeGetPayloadType = { initiativeId: string };

export const idpayInitiativeGet = createAsyncAction(
  "IDPAY_INITIATIVE_DETAILS_REQUEST",
  "IDPAY_INITIATIVE_DETAILS_SUCCESS",
  "IDPAY_INITIATIVE_DETAILS_FAILURE"
)<IdPayInitiativeGetPayloadType, InitiativeDTO1, NetworkError>();

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
  initiativeId: InitiativeDTO1["initiativeId"];
  operationId: OperationListDTO["operationId"];
};

export type IdPayBeneficiaryDetailsGetPayloadType = {
  initiativeId: InitiativeDTO1["initiativeId"];
};

export const idPayBeneficiaryDetailsGet = createAsyncAction(
  "IDPAY_BENEFICIARY_DETAILS_REQUEST",
  "IDPAY_BENEFICIARY_DETAILS_SUCCESS",
  "IDPAY_BENEFICIARY_DETAILS_FAILURE"
)<IdPayBeneficiaryDetailsGetPayloadType, InitiativeDetailDTO, NetworkError>();

export type IdPayOnboardingStatusGetPayloadType = {
  initiativeId: InitiativeDTO1["initiativeId"];
};

export const idPayOnboardingStatusGet = createAsyncAction(
  "IDPAY_ONBOARDNIG_STATUS_REQUEST",
  "IDPAY_ONBOARDNIG_STATUS_SUCCESS",
  "IDPAY_ONBOARDNIG_STATUS_FAILURE"
)<IdPayOnboardingStatusGetPayloadType, OnboardingStatusDTO, NetworkError>();

export type IdPayInitiativeActions =
  | ActionType<typeof idpayInitiativeGet>
  | ActionType<typeof idpayTimelinePageGet>
  | ActionType<typeof idPayBeneficiaryDetailsGet>
  | ActionType<typeof idPayOnboardingStatusGet>;
