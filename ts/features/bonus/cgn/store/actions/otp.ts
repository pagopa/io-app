import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { Otp } from "../../../../../../definitions/cgn/Otp";

/**
 * handle CGN Otp generation
 */
export const cgnGenerateOtp = createAsyncAction(
  "CGN_GENERATE_OTP_REQUEST",
  "CGN_GENERATE_OTP_SUCCESS",
  "CGN_GENERATE_OTP_FAILURE"
)<void, Otp, NetworkError>();

/**
 * handle CGN Otp generation
 */
export const resetOtpState = createStandardAction(
  "CGN_OTP_STATE_RESET"
)<void>();

export type CgnOtpActions =
  | ActionType<typeof cgnGenerateOtp>
  | ActionType<typeof resetOtpState>;
