import { PaymentsMethodDetailsActions } from "../../../details/store/actions";
import { PaymentsHistoryActions } from "../../../history/store/actions";
import { PaymentsOnboardingActions } from "../../../onboarding/store/actions";
import { PaymentsPaymentActions } from "../../../payment/store/actions";
import { PaymentsTransactionActions } from "../../../transaction/store/actions";

export type PaymentsActions =
  | PaymentsOnboardingActions
  | PaymentsMethodDetailsActions
  | PaymentsPaymentActions
  | PaymentsTransactionActions
  | PaymentsHistoryActions;
