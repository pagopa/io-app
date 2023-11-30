import { WalletDetailsActions } from "../../../details/store/actions";
import { WalletOnboardingActions } from "../../../onboarding/store/actions";

export type WalletV3Actions = WalletOnboardingActions | WalletDetailsActions;
