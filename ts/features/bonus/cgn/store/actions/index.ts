import { CgnActivationActions } from "./activation";
import { CgnDetailsActions } from "./details";
import { CgnEycaActivationActions } from "./eyca/activation";
import { CgnEycaStatusActions } from "./eyca/details";
import { CgnMerchantsAction } from "./merchants";
import { CgnOtpActions } from "./otp";
import { CgnBucketActions } from "./bucket";
import { CgnUnsubscribeActions } from "./unsubscribe";
import { CgnCategoriesActions } from "./categories";

export type CgnActions =
  | CgnActivationActions
  | CgnDetailsActions
  | CgnEycaActivationActions
  | CgnEycaStatusActions
  | CgnMerchantsAction
  | CgnOtpActions
  | CgnBucketActions
  | CgnUnsubscribeActions
  | CgnCategoriesActions;
