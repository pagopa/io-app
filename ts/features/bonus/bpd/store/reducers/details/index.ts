import { Action, combineReducers } from "redux";
import { IndexedById } from "../../../../../../store/helpers/indexer";
import bpdActivationReducer, { BpdActivation } from "./activation";
import { BpdPaymentMethods, bpdPaymentMethodsReducer } from "./paymentMethods";

export type BpdDetailsState = {
  activation: BpdActivation;
  paymentMethods: IndexedById<BpdPaymentMethods>;
  // IBAN, value, points, other info...
};

const bpdDetailsReducer = combineReducers<BpdDetailsState, Action>({
  activation: bpdActivationReducer,
  paymentMethods: bpdPaymentMethodsReducer
});

export default bpdDetailsReducer;
