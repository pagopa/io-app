import { call } from "typed-redux-saga/macro";
import { NavigationActions } from "react-navigation";
import NavigationService from "../../../../../navigation/NavigationService";
import {
  optInPaymentMethodsBack,
  optInPaymentMethodsCancel,
  optInPaymentMethodsCompleted,
  optInPaymentMethodsFailure
} from "../../store/actions/optInPaymentMethods";
import {
  executeWorkUnit,
  withFailureHandling,
  withResetNavigationStack
} from "../../../../../sagas/workUnit";
import BPD_ROUTES from "../../navigation/routes";

function* optInPaymentMethodsWorkUnit() {
  return yield* call(executeWorkUnit, {
    startScreenNavigation: () => {
      NavigationService.dispatchNavigationAction(
        NavigationActions.navigate({
          routeName: BPD_ROUTES.OPT_IN_PAYMENT_METHODS.CASHBACK_UPDATE
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
