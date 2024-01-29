import * as E from "fp-ts/lib/Either";
import { call } from "typed-redux-saga/macro";
import { EnableableFunctionsEnum } from "../../../../../../definitions/pagopa/EnableableFunctions";
import { navigateToWalletHome } from "../../../../../store/actions/navigation";
import { PaymentMethod } from "../../../../../types/pagopa";
import { SagaCallReturnType } from "../../../../../types/utils";
import { hasFunctionEnabled } from "../../../../../utils/walletv2";
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

  // Error while reading the bpdEnabled, return to wallet
  if (E.isLeft(isBpdEnabledResponse)) {
    yield* call(navigateToWalletHome);
  } else {
    if (isBpdEnabledResponse.right) {
      // navigate to activate cashback on new payment methods if the user is onboarded to the program and is active
      yield* call(navigateToActivateNewMethods);
    }
  }
}
