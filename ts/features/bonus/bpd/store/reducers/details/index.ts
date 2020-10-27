import * as pot from "italia-ts-commons/lib/pot";
import { Action, combineReducers } from "redux";
import { IndexedById } from "../../../../../../store/helpers/indexer";
import { RemoteValue } from "../../../model/RemoteValue";
import { BpdPeriod } from "../../actions/periods";
import bpdActivationReducer, { BpdActivation } from "./activation";
import {
  bpdPaymentMethodsReducer,
  BpdPotPaymentMethodActivation
} from "./paymentMethods";
import { bpdPeriodsReducer } from "./periods";

export type BpdDetailsState = {
  activation: BpdActivation;
  paymentMethods: IndexedById<BpdPotPaymentMethodActivation>;
  periods: pot.Pot<IndexedById<BpdPeriod>, Error>;
  // IBAN, value, points, other info...
};

const bpdDetailsReducer = combineReducers<BpdDetailsState, Action>({
  activation: bpdActivationReducer,
  paymentMethods: bpdPaymentMethodsReducer,
  periods: bpdPeriodsReducer
});

export default bpdDetailsReducer;
