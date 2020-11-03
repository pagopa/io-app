import { combineReducers } from "redux";
import { Action } from "../../actions/types";
import creditCardHistoryReducer, {
  CreditCardHistoryState
} from "../wallet/creditCard";
import paymentsCurrentReducer, { PaymentsCurrentState } from "./current";
import paymentsHistoryReducer, { PaymentsHistoryState } from "./history";
import paymentsLastDeletedReducer, {
  PaymentsLastDeletedState
} from "./lastDeleted";

export type PaymentsState = {
  current: PaymentsCurrentState;
  lastDeleted: PaymentsLastDeletedState;
  history: PaymentsHistoryState;
  creditCardHistory: CreditCardHistoryState;
};

const paymentsReducer = combineReducers<PaymentsState, Action>({
  current: paymentsCurrentReducer,
  lastDeleted: paymentsLastDeletedReducer,
  history: paymentsHistoryReducer,
  creditCardHistory: creditCardHistoryReducer
});

export default paymentsReducer;
