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
import homeReducer, { PaymentsHomeState } from "../../../home/store/reducers";
import onboardingReducer, {
  PaymentsOnboardingState
} from "../../../onboarding/store/reducers";
import receiptReducer, {
  ReceiptTransactionState
} from "../../../receipts/store/reducers";
import paymentsWalletReducer, {
  PaymentsWalletState
} from "../../../wallet/store/reducers";
import paymentsPagoPaPlatformReducer, {
  PaymentsPagoPaPlatformState
} from "./pagoPaPlatformReducer";
import paymentsBackoffRetryReducer, {
  PaymentsBackoffRetryState
} from "./paymentsBackoffRetryReducer";

export type PaymentsState = {
  checkout: PaymentsCheckoutState;
  details: PaymentsMethodDetailsState & PersistPartial;
  history: PaymentsHistoryState & PersistPartial;
  home: PaymentsHomeState & PersistPartial;
  onboarding: PaymentsOnboardingState;
  pagoPaPlatform: PaymentsPagoPaPlatformState;
  paymentsBackoffRetry: PaymentsBackoffRetryState;
  receipt: ReceiptTransactionState;
  wallet: PaymentsWalletState;
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
