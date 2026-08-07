import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";

import { Otp } from "../../../../../../definitions/cgn/Otp";
import { NetworkError } from "../../../../../utils/errors";

type CgnRequestOtpPayload = {
  onError: () => void;
  onSuccess: () => void;
};

/** Handle CGN Otp generation */
export const cgnGenerateOtp = createAsyncAction(
  "CGN_GENERATE_OTP_REQUEST",
  "CGN_GENERATE_OTP_SUCCESS",
  "CGN_GENERATE_OTP_FAILURE"
)<CgnRequestOtpPayload, Otp, NetworkError>();

/** Handle CGN Otp generation */
export const resetOtpState = createStandardAction(
  "CGN_OTP_STATE_RESET"
)<void>();

export type CgnOtpActions =
  | ActionType<typeof cgnGenerateOtp>
  | ActionType<typeof resetOtpState>;
