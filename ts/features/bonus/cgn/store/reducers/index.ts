import { Action, combineReducers } from "redux";
import cgnActivationReducer, { ActivationState } from "./activation";
import cgnDetailsReducer, { CgnDetailsState } from "./details";
import eycaReducer, { EycaState } from "./eyca";
import cgnMerchantsReducer, { CgnMerchantsState } from "./merchants";
import cgnOtpReducer, { CgnOtpState } from "./otp";
import cgnBucketReducer, { CgnBucketState } from "./bucket";
import cgnUnsubscribeReducer, { CgnUnsubscribeState } from "./unsubscribe";
import cgnCategoriesReducer, { CgnCategoriesState } from "./categories";

export type CgnState = {
  activation: ActivationState;
  detail: CgnDetailsState;
  eyca: EycaState;
  merchants: CgnMerchantsState;
  categories: CgnCategoriesState;
  otp: CgnOtpState;
  bucket: CgnBucketState;
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
