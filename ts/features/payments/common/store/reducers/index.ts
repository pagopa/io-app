import { combineReducers } from "redux";
import { PersistPartial } from "redux-persist";
import detailsReducer, {
  PaymentsMethodDetailsState
} from "../../../details/store/reducers";
import historyReducer, {
  PaymentsHistoryState
} from "../../../history/store/reducers";
import onboardingReducer, {
  PaymentsOnboardingState
} from "../../../onboarding/store/reducers";
import paymentReducer, {
  PaymentsCheckoutState
} from "../../../checkout/store/reducers";
import transactionReducer, {
  PaymentsTransactionState
} from "../../../transaction/store/reducers";
import homeReducer, { PaymentsHomeState } from "../../../home/store/reducers";

export type PaymentsState = {
  onboarding: PaymentsOnboardingState;
  details: PaymentsMethodDetailsState;
  payment: PaymentsCheckoutState;
  transaction: PaymentsTransactionState;
  history: PaymentsHistoryState & PersistPartial;
  home: PaymentsHomeState & PersistPartial;
};

const paymentsReducer = combineReducers({
  onboarding: onboardingReducer,
  details: detailsReducer,
  payment: paymentReducer,
  transaction: transactionReducer,
  history: historyReducer,
  home: homeReducer
});

export default paymentsReducer;
