import { NavigationNavigateAction } from "react-navigation";
import { call, put } from "redux-saga/effects";
import { navigateToWalletHome } from "../../../../../store/actions/navigation";
import {
  EnableableFunctionsTypeEnum,
  PaymentMethod
} from "../../../../../types/pagopa";
import { SagaCallReturnType } from "../../../../../types/utils";
import { hasFunctionEnabled } from "../../../../../utils/walletv2";
import { navigateToSuggestBpdActivation } from "../../../../wallet/onboarding/bancomat/navigation/action";
import { isBpdEnabled } from "./onboarding/startOnboarding";

/**
 * Allows the user to activate bpd on a set of new added payment methods
 */
export function* activateBpdOnNewPaymentMethods(
  paymentMethods: ReadonlyArray<PaymentMethod>,
  navigateToActivateNewMethods: NavigationNavigateAction
) {
  const atLeastOneBancomatWithBpdCapability = paymentMethods.some(b =>
    hasFunctionEnabled(b, EnableableFunctionsTypeEnum.BPD)
  );

  // No payment method with bpd capability added in the current workflow, return to wallet home
  if (!atLeastOneBancomatWithBpdCapability) {
    return yield put(navigateToWalletHome());
  }
  const isBpdEnabledResponse: SagaCallReturnType<typeof isBpdEnabled> = yield call(
    isBpdEnabled
  );

  // Error while reading the bpdEnabled, return to wallet
  if (isBpdEnabledResponse.isLeft()) {
    yield put(navigateToWalletHome());
  } else {
    if (isBpdEnabledResponse.value) {
      // navigate to activation new bancomat
      yield put(navigateToActivateNewMethods);
    } else {
      // navigate to "ask if u want to start bpd activation"
      yield put(navigateToSuggestBpdActivation());
    }
  }
}
