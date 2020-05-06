import { combineReducers } from "redux";
import { Action } from "../../actions/types";
import paymentsCurrentReducer, { PaymentsCurrentState } from "./current";
import paymentsHistoryReducer, { PaymentsHistoryState } from "./history";
import paymentsLastDeletedReducer, {
  PaymentsLastDeletedState
} from "./lastDeleted";

export type PaymentsState = {
  current: PaymentsCurrentState;
  lastDeleted: PaymentsLastDeletedState;
  history: PaymentsHistoryState;
};

const paymentsReducer = combineReducers<PaymentsState, Action>({
  current: paymentsCurrentReducer,
  lastDeleted: paymentsLastDeletedReducer,
  history: paymentsHistoryReducer
});

export default paymentsReducer;
