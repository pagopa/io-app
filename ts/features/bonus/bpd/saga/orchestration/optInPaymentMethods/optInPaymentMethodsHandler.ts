import { NavigationActions } from "@react-navigation/compat";
import { call } from "redux-saga/effects";
import NavigationService from "../../../../../../navigation/NavigationService";
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
  return yield call(executeWorkUnit, {
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
  yield call(withFailureHandling, () =>
    withResetNavigationStack(optInPaymentMethodsWorkUnit)
  );
}
