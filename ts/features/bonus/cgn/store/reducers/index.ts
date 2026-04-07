import { Action, combineReducers } from "redux";

import cgnActivationReducer, { ActivationState } from "./activation";
import cgnBucketReducer, { CgnBucketState } from "./bucket";
import cgnCategoriesReducer, { CgnCategoriesState } from "./categories";
import cgnDetailsReducer, { CgnDetailsState } from "./details";
import eycaReducer, { EycaState } from "./eyca";
import cgnMerchantsReducer, { CgnMerchantsState } from "./merchants";
import cgnOtpReducer, { CgnOtpState } from "./otp";
import cgnUnsubscribeReducer, { CgnUnsubscribeState } from "./unsubscribe";

export type CgnState = {
  activation: ActivationState;
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
  detail: cgnDetailsReducer,
  merchants: cgnMerchantsReducer,
  categories: cgnCategoriesReducer,
  otp: cgnOtpReducer,
  bucket: cgnBucketReducer,
  eyca: eycaReducer,
  unsubscribe: cgnUnsubscribeReducer
});

export default cgnReducer;
