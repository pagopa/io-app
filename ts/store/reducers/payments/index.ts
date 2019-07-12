import { combineReducers } from "redux";
import { Action } from "../../actions/types";
import paymentsCurrentReducer, { PaymentsCurrentState } from "./current";
import paymentsLastDeletedReducer, {
  PaymentsLastDeletedState
} from "./lastDeleted";

export type PaymentsState = {
  current: PaymentsCurrentState;
  lastDeleted: PaymentsLastDeletedState;
};

const paymentsReducer = combineReducers<PaymentsState, Action>({
  current: paymentsCurrentReducer,
  lastDeleted: paymentsLastDeletedReducer
});

export default paymentsReducer;
