import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { Otp } from "../../../../../../definitions/cgn/Otp";

/**
 * handle CGN Otp generation
 */
export const cngGenerateOtp = createAsyncAction(
  "CGN_GENERATE_OTP_REQUEST",
  "CGN_GENERATE_OTP_SUCCESS",
  "CGN_GENERATE_OTP_FAILURE"
)<void, Otp, NetworkError>();

export type CgnOtpActions = ActionType<typeof cngGenerateOtp>;
