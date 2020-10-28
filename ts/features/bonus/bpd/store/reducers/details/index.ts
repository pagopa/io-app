import * as pot from "italia-ts-commons/lib/pot";
import { Action, combineReducers } from "redux";
import { IndexedById } from "../../../../../../store/helpers/indexer";
import { BpdAmount } from "../../actions/amount";
import { BpdPeriod } from "../../actions/periods";
import bpdActivationReducer, { BpdActivation } from "./activation";
import { bpdAmountsReducer } from "./amounts";
import {
  bpdPaymentMethodsReducer,
  BpdPotPaymentMethodActivation
} from "./paymentMethods";
import { bpdPeriodsReducer } from "./periods";

export type BpdDetailsState = {
  activation: BpdActivation;
  paymentMethods: IndexedById<BpdPotPaymentMethodActivation>;
  periods: pot.Pot<IndexedById<BpdPeriod>, Error>;
  amounts: IndexedById<pot.Pot<BpdAmount, Error>>;
  // IBAN, value, points, other info...
};

const bpdDetailsReducer = combineReducers<BpdDetailsState, Action>({
  activation: bpdActivationReducer,
  paymentMethods: bpdPaymentMethodsReducer,
  periods: bpdPeriodsReducer,
  amounts: bpdAmountsReducer
});

export default bpdDetailsReducer;
