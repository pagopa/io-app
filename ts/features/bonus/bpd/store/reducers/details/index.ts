import * as pot from "italia-ts-commons/lib/pot";
import { Action, combineReducers } from "redux";
import { IndexedById } from "../../../../../../store/helpers/indexer";
import { BpdTransaction } from "../../actions/transactions";
import bpdActivationReducer, { BpdActivation } from "./activation";
import {
  bpdPaymentMethodsReducer,
  BpdPotPaymentMethodActivation
} from "./paymentMethods";
import { BpdPeriodWithInfo, bpdPeriodsReducer } from "./periods";
import { bpdSelectedPeriodsReducer } from "./selectedPeriod";
import { bpdTransactionsReducer } from "./transactions";

export type BpdDetailsState = {
  activation: BpdActivation;
  paymentMethods: IndexedById<BpdPotPaymentMethodActivation>;
  periods: pot.Pot<IndexedById<BpdPeriodWithInfo>, Error>;
  selectedPeriod: BpdPeriodWithInfo | null;
  transactions: IndexedById<pot.Pot<ReadonlyArray<BpdTransaction>, Error>>;
};

const bpdDetailsReducer = combineReducers<BpdDetailsState, Action>({
  // The information related to the activation (enabled / IBAN)
  activation: bpdActivationReducer,
  // The state of cashback on each payment method in the wallet
  paymentMethods: bpdPaymentMethodsReducer,
  // All the periods of the cashback
  periods: bpdPeriodsReducer,
  // the current period displayed, selected by the user
  selectedPeriod: bpdSelectedPeriodsReducer,
  transactions: bpdTransactionsReducer
});

export default bpdDetailsReducer;
