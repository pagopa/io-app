import * as E from "fp-ts/lib/Either";
import { call, select } from "typed-redux-saga/macro";
import { EnableableFunctionsEnum } from "../../../../../../definitions/pagopa/EnableableFunctions";
import { navigateToWalletHome } from "../../../../../store/actions/navigation";
import { bpdRemoteConfigSelector } from "../../../../../store/reducers/backendStatus";
import { PaymentMethod } from "../../../../../types/pagopa";
import { SagaCallReturnType } from "../../../../../types/utils";
import { hasFunctionEnabled } from "../../../../../utils/walletv2";
import { navigateToSuggestBpdActivation } from "../../../../wallet/onboarding/bancomat/navigation/action";
import { isBpdEnabled } from "./onboarding/startOnboarding";

/**
 * Allows the user to activate bpd on a set of new added payment methods
 */
export function* activateBpdOnNewPaymentMethods(
  paymentMethods: ReadonlyArray<PaymentMethod>,
  navigateToActivateNewMethods: () => void
) {
  const atLeastOnePaymentMethodWithBpdCapability = paymentMethods.some(b =>
    hasFunctionEnabled(b, EnableableFunctionsEnum.BPD)
  );

  // No payment method with bpd capability added in the current workflow, return to wallet home
  if (!atLeastOnePaymentMethodWithBpdCapability) {
    return yield* call(navigateToWalletHome);
  }
  const isBpdEnabledResponse: SagaCallReturnType<typeof isBpdEnabled> =
    yield* call(isBpdEnabled);

  const bpdRemoteConfig: ReturnType<typeof bpdRemoteConfigSelector> =
    yield* select(bpdRemoteConfigSelector);

  // Error while reading the bpdEnabled, return to wallet
  if (E.isLeft(isBpdEnabledResponse)) {
    yield* call(navigateToWalletHome);
  } else {
    if (isBpdEnabledResponse.right && bpdRemoteConfig?.program_active) {
      // navigate to activate cashback on new payment methods if the user is onboarded to the program and is active
      yield* call(navigateToActivateNewMethods);
    } else if (bpdRemoteConfig?.enroll_bpd_after_add_payment_method) {
      // navigate to "ask if you want to start bpd onboarding"
      yield* call(navigateToSuggestBpdActivation);
    }
  }
}
