import { CommonActions } from "@react-navigation/native";
import { call } from "typed-redux-saga/macro";
import NavigationService from "../../../../../../navigation/NavigationService";
import ROUTES from "../../../../../../navigation/routes";
import {
  executeWorkUnit,
  withFailureHandling,
  withResetNavigationStack
} from "../../../../../../sagas/workUnit";
import BPD_ROUTES from "../../../navigation/routes";
import {
  optInPaymentMethodsBack,
  optInPaymentMethodsCancel,
  optInPaymentMethodsCompleted,
  optInPaymentMethodsFailure
} from "../../../store/actions/optInPaymentMethods";

function* optInPaymentMethodsWorkUnit() {
  return yield* call(executeWorkUnit, {
    startScreenNavigation: () => {
      NavigationService.dispatchNavigationAction(
        CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
          screen: BPD_ROUTES.OPT_IN_PAYMENT_METHODS.MAIN,
          params: {
            screen: BPD_ROUTES.OPT_IN_PAYMENT_METHODS.CASHBACK_UPDATE
          }
        })
      );
    },
    startScreenName: BPD_ROUTES.OPT_IN_PAYMENT_METHODS.CASHBACK_UPDATE,
    complete: optInPaymentMethodsCompleted,
    back: optInPaymentMethodsBack,
    cancel: optInPaymentMethodsCancel,
    failure: optInPaymentMethodsFailure
  });
}

export function* optInPaymentMethodsHandler() {
  yield* call(withFailureHandling, () =>
    withResetNavigationStack(optInPaymentMethodsWorkUnit)
  );
}
