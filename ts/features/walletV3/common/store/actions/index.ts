import { WalletOnboardingActions } from "../../../onboarding/store/actions";
import { WalletPaymentActions } from "../../../payment/store/actions";

export type WalletV3Actions = WalletOnboardingActions | WalletPaymentActions;
