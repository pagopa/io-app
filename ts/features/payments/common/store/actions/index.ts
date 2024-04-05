import { PaymentsMethodDetailsActions } from "../../../details/store/actions";
import { PaymentsHistoryActions } from "../../../history/store/actions";
import { PaymentsOnboardingActions } from "../../../onboarding/store/actions";
import { PaymentsCheckoutActions } from "../../../checkout/store/actions";
import { PaymentsTransactionActions } from "../../../transaction/store/actions";
import { PaymentsWalletActions } from "../../../wallet/store/actions";

export type PaymentsActions =
  | PaymentsOnboardingActions
  | PaymentsMethodDetailsActions
  | PaymentsCheckoutActions
  | PaymentsTransactionActions
  | PaymentsHistoryActions
  | PaymentsWalletActions;
