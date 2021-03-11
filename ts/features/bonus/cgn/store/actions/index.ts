import { CgnActivationActions } from "./activation";
import { CgnDetailsActions } from "./details";
import { CgnEycaActivationActions } from "./eyca/activation";
import { CgnEycaDetailsActions } from "./eyca/details";
import { CgnMerchantsAction } from "./merchants";
import { CgnOtpActions } from "./otp";

export type CgnActions =
  | CgnActivationActions
  | CgnDetailsActions
  | CgnEycaActivationActions
  | CgnEycaDetailsActions
  | CgnMerchantsAction
  | CgnOtpActions;
