import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { CheckEnrollmentDTO } from "../../../../../../definitions/idpay/CheckEnrollmentDTO";
import { GenerateCodeRespDTO } from "../../../../../../definitions/idpay/GenerateCodeRespDTO";
import { NetworkError } from "../../../../../utils/errors";

/**
 * This action requests the CIE enabled status from the server
 */
export const idPayGetCodeStatus = createAsyncAction(
  "IDPAY_GET_CODE_STATUS_REQUEST",
  "IDPAY_GET_CODE_STATUS_SUCCESS",
  "IDPAY_GET_CODE_STATUS_FAILURE"
)<undefined, CheckEnrollmentDTO, NetworkError>();

type IdPayGenerateCodePayload = {
  initiativeId?: string;
};

/**
 * This action performs the request to generate the IDPay code from the server
 */
export const idPayGenerateCode = createAsyncAction(
  "IDPAY_GENERATE_CODE_REQUEST",
  "IDPAY_GENERATE_CODE_SUCCESS",
  "IDPAY_GENERATE_CODE_FAILURE"
)<IdPayGenerateCodePayload, GenerateCodeRespDTO, NetworkError>();

type IdPayEnrollCodePayload = {
  initiativeId: string;
};

/**
 * This action performs the request to generate the IDPay code from the server
 */
export const idPayEnrollCode = createAsyncAction(
  "IDPAY_ENROLL_CODE_REQUEST",
  "IDPAY_ENROLL_CODE_SUCCESS",
  "IDPAY_ENROLL_CODE_FAILURE"
)<IdPayEnrollCodePayload, undefined, NetworkError>();

/**
 * This action resets the IDPay code state in store.
 */
export const idPayResetCode =
  createStandardAction("IDPAY_RESET_CODE")<undefined>();

type IdPayCodeCieBannerClosePayloadType = {
  initiativeId: string;
};

/** This action is used to close a CIE banner into an initiative details */
export const idPayCodeCieBannerClose = createStandardAction(
  "IDPAY_CODE_CIE_BANNER_CLOSE"
)<IdPayCodeCieBannerClosePayloadType>();

export type IdPayCodeActions =
  | ActionType<typeof idPayGetCodeStatus>
  | ActionType<typeof idPayGenerateCode>
  | ActionType<typeof idPayEnrollCode>
  | ActionType<typeof idPayResetCode>
  | ActionType<typeof idPayCodeCieBannerClose>;
