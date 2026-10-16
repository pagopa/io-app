import { InitiativeDetailDTO } from "@io-app/api-types/generated/definitions/idpay/InitiativeDetailDTO";
import { InitiativeDTO } from "@io-app/api-types/generated/definitions/idpay/InitiativeDTO";
import { OnboardingStatusDTO } from "@io-app/api-types/generated/definitions/idpay/OnboardingStatusDTO";
import { TimelineDTO } from "@io-app/api-types/generated/definitions/idpay/TimelineDTO";
import { ActionType, createAsyncAction } from "typesafe-actions";

import { NetworkError } from "../../../../../utils/errors";

type IdPayInitiativeGetPayloadType = { initiativeId: string };

export const idpayInitiativeGet = createAsyncAction(
  "IDPAY_INITIATIVE_DETAILS_REQUEST",
  "IDPAY_INITIATIVE_DETAILS_SUCCESS",
  "IDPAY_INITIATIVE_DETAILS_FAILURE"
)<IdPayInitiativeGetPayloadType, InitiativeDTO, NetworkError>();

type IdpayTimelinePageGetPayloadType = {
  initiativeId: string;
  page?: number;
  pageSize?: number;
};

type IdPayTimelinePageGetSuccessPayloadType = {
  page: number;
  timeline: TimelineDTO;
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

type IdPayBeneficiaryDetailsGetPayloadType = {
  initiativeId: InitiativeDTO["initiativeId"];
};

export const idPayBeneficiaryDetailsGet = createAsyncAction(
  "IDPAY_BENEFICIARY_DETAILS_REQUEST",
  "IDPAY_BENEFICIARY_DETAILS_SUCCESS",
  "IDPAY_BENEFICIARY_DETAILS_FAILURE"
)<IdPayBeneficiaryDetailsGetPayloadType, InitiativeDetailDTO, NetworkError>();

type IdPayOnboardingStatusGetPayloadType = {
  initiativeId: InitiativeDTO["initiativeId"];
};

export const idPayOnboardingStatusGet = createAsyncAction(
  "IDPAY_ONBOARDNIG_STATUS_REQUEST",
  "IDPAY_ONBOARDNIG_STATUS_SUCCESS",
  "IDPAY_ONBOARDNIG_STATUS_FAILURE"
)<IdPayOnboardingStatusGetPayloadType, OnboardingStatusDTO, NetworkError>();

export type IdPayInitiativeActions =
  | ActionType<typeof idPayBeneficiaryDetailsGet>
  | ActionType<typeof idpayInitiativeGet>
  | ActionType<typeof idPayOnboardingStatusGet>
  | ActionType<typeof idpayTimelinePageGet>;
