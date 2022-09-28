import * as pot from "@pagopa/ts-commons/lib/pot";
import { Action, combineReducers } from "redux";
import { IndexedById } from "../../../../../../store/helpers/indexer";
import { BpdTransaction } from "../../actions/transactions";
import bpdActivationReducer, { BpdActivation } from "./activation";
import { bpdLastUpdateReducer, lastUpdate } from "./lastUpdate";
import {
  bpdPaymentMethodsReducer,
  BpdPotPaymentMethodActivation
} from "./paymentMethods";
import { bpdPeriodsReducer, BpdPeriodWithInfo } from "./periods";
import { bpdSelectedPeriodsReducer } from "./selectedPeriod";
import { bpdTransactionsReducer } from "./transactions";
import {
  bpdTransactionsV2Reducer,
  BpdTransactionsV2State
} from "./transactionsv2";

export type BpdDetailsState = {
  activation: BpdActivation;
  paymentMethods: IndexedById<BpdPotPaymentMethodActivation>;
  periods: pot.Pot<IndexedById<BpdPeriodWithInfo>, Error>;
  selectedPeriod: BpdPeriodWithInfo | null;
  transactions: IndexedById<pot.Pot<ReadonlyArray<BpdTransaction>, Error>>;
  transactionsV2: BpdTransactionsV2State;
  lastUpdate: lastUpdate;
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
  transactions: bpdTransactionsReducer,
  // TODO: replace with transactions when completed
  transactionsV2: bpdTransactionsV2Reducer,
  // the last time we received updated data
  lastUpdate: bpdLastUpdateReducer
});

export default bpdDetailsReducer;
