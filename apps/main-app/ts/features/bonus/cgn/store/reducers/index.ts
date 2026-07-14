import { Action, combineReducers } from "redux";
import { PersistPartial } from "redux-persist";

import cgnActivationReducer, { ActivationState } from "./activation";
import { cgnBannersPersistent, CgnBannersState } from "./banners";
import cgnBucketReducer, { CgnBucketState } from "./bucket";
import cgnCategoriesReducer, { CgnCategoriesState } from "./categories";
import cgnDetailsReducer, { CgnDetailsState } from "./details";
import eycaReducer, { EycaState } from "./eyca";
import cgnMerchantsReducer, { CgnMerchantsState } from "./merchants";
import cgnOtpReducer, { CgnOtpState } from "./otp";
import cgnUnsubscribeReducer, { CgnUnsubscribeState } from "./unsubscribe";

export type CgnState = {
  activation: ActivationState;
  banners: CgnBannersState & PersistPartial;
  bucket: CgnBucketState;
  categories: CgnCategoriesState;
  detail: CgnDetailsState;
  eyca: EycaState;
  merchants: CgnMerchantsState;
  otp: CgnOtpState;
  unsubscribe: CgnUnsubscribeState;
};

const cgnReducer = combineReducers<CgnState, Action>({
  activation: cgnActivationReducer,
  banners: cgnBannersPersistent,
  detail: cgnDetailsReducer,
  merchants: cgnMerchantsReducer,
  categories: cgnCategoriesReducer,
  otp: cgnOtpReducer,
  bucket: cgnBucketReducer,
  eyca: eycaReducer,
  unsubscribe: cgnUnsubscribeReducer
});

export default cgnReducer;
