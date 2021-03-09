import { CgnActivationActions } from "./activation";
import { CgnDetailsActions } from "./details";
import { CgnMerchantsAction } from "./merchants";
import { CgnOtpActions } from "./otp";

export type CgnActions =
  | CgnActivationActions
  | CgnDetailsActions
  | CgnMerchantsAction
  | CgnOtpActions;
