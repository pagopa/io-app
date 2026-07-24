import { CgnActivationActions } from "./activation";
import { CgnBannersActions } from "./banners";
import { CgnBucketActions } from "./bucket";
import { CgnCategoriesActions } from "./categories";
import { CgnDetailsActions } from "./details";
import { CgnEycaActivationActions } from "./eyca/activation";
import { CgnEycaStatusActions } from "./eyca/details";
import { CgnMerchantsAction } from "./merchants";
import { CgnOtpActions } from "./otp";
import { CgnUnsubscribeActions } from "./unsubscribe";

export type CgnActions =
  | CgnActivationActions
  | CgnBannersActions
  | CgnBucketActions
  | CgnCategoriesActions
  | CgnDetailsActions
  | CgnEycaActivationActions
  | CgnEycaStatusActions
  | CgnMerchantsAction
  | CgnOtpActions
  | CgnUnsubscribeActions;
