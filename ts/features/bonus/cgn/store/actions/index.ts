import { CgnActivationActions } from "./activation";
import { CgnBannersActions } from "./banners";
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
  | CgnBannersActions
  | CgnDetailsActions
  | CgnEycaActivationActions
  | CgnEycaStatusActions
  | CgnMerchantsAction
  | CgnOtpActions
  | CgnBucketActions
  | CgnUnsubscribeActions
  | CgnCategoriesActions;
