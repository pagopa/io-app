import { WalletDetailsActions } from "../../../details/store/actions";
import { WalletOnboardingActions } from "../../../onboarding/store/actions";
import { WalletPaymentActions } from "../../../payment/store/actions";
import { WalletTransactionActions } from "../../../transaction/store/actions";

export type WalletActions =
  | WalletOnboardingActions
  | WalletDetailsActions
  | WalletPaymentActions
  | WalletTransactionActions;
