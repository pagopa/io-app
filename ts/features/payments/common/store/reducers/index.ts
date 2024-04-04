import { combineReducers } from "redux";
import { PersistPartial } from "redux-persist";
import paymentReducer, {
  PaymentsCheckoutState
} from "../../../checkout/store/reducers";
import detailsReducer, {
  PaymentsMethodDetailsState
} from "../../../details/store/reducers";
import historyReducer, {
  PaymentsHistoryState
} from "../../../history/store/reducers";
import onboardingReducer, {
  PaymentsOnboardingState
} from "../../../onboarding/store/reducers";
import transactionReducer, {
  PaymentsTransactionState
} from "../../../transaction/store/reducers";
import homeReducer, { PaymentsHomeState } from "../../../home/store/reducers";
import paymentsWalletReducer, {
  PaymentsWalletState
} from "../../../wallet/store/reducers";

export type PaymentsState = {
  onboarding: PaymentsOnboardingState;
  details: PaymentsMethodDetailsState;
  checkout: PaymentsCheckoutState;
  transaction: PaymentsTransactionState;
  history: PaymentsHistoryState & PersistPartial;
  home: PaymentsHomeState & PersistPartial;
  wallet: PaymentsWalletState;
};

const paymentsReducer = combineReducers({
  onboarding: onboardingReducer,
  details: detailsReducer,
  checkout: paymentReducer,
  transaction: transactionReducer,
  history: historyReducer,
  home: homeReducer,
  wallet: paymentsWalletReducer
});

export default paymentsReducer;
