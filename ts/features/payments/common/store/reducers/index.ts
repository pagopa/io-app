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
import homeReducer, { PaymentsHomeState } from "../../../home/store/reducers";
import paymentsWalletReducer, {
  PaymentsWalletState
} from "../../../wallet/store/reducers";
import receiptReducer, {
  ReceiptTransactionState
} from "../../../receipts/store/reducers";
import paymentsPagoPaPlatformReducer, {
  PaymentsPagoPaPlatformState
} from "./pagoPaPlatformReducer";
import paymentsBackoffRetryReducer, {
  PaymentsBackoffRetryState
} from "./paymentsBackoffRetryReducer";

export type PaymentsState = {
  onboarding: PaymentsOnboardingState;
  details: PaymentsMethodDetailsState & PersistPartial;
  checkout: PaymentsCheckoutState;
  history: PaymentsHistoryState & PersistPartial;
  home: PaymentsHomeState & PersistPartial;
  wallet: PaymentsWalletState;
  receipt: ReceiptTransactionState;
  pagoPaPlatform: PaymentsPagoPaPlatformState;
  paymentsBackoffRetry: PaymentsBackoffRetryState;
};

const paymentsReducer = combineReducers({
  onboarding: onboardingReducer,
  details: detailsReducer,
  checkout: paymentReducer,
  history: historyReducer,
  home: homeReducer,
  wallet: paymentsWalletReducer,
  receipt: receiptReducer,
  pagoPaPlatform: paymentsPagoPaPlatformReducer,
  paymentsBackoffRetry: paymentsBackoffRetryReducer
});

export default paymentsReducer;
