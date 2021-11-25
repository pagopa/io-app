import { call } from "redux-saga/effects";
import { NavigationActions } from "react-navigation";
import {
  executeWorkUnit,
  withResetNavigationStack
} from "../../../../../../sagas/workUnit";
import PAYPAL_ROUTES from "../../navigation/routes";
import NavigationService from "../../../../../../navigation/NavigationService";
import {
  walletAddPaypalBack,
  walletAddPaypalCancel,
  walletAddPaypalCompleted,
  walletAddPaypalFailure
} from "../../store/actions";

// handle the flow of paypal onboarding
function* paypalWorkOnboaringUnit() {
  return yield call(executeWorkUnit, {
    startScreenNavigation: () =>
      NavigationService.dispatchNavigationAction(
        NavigationActions.navigate({
          routeName: PAYPAL_ROUTES.ONBOARDING.START
        })
      ),
    startScreenName: PAYPAL_ROUTES.ONBOARDING.START,
    complete: walletAddPaypalCompleted,
    back: walletAddPaypalBack,
    cancel: walletAddPaypalCancel,
    failure: walletAddPaypalFailure
  });
}

export function* addPaypalToWallet() {
  yield call(withResetNavigationStack, paypalWorkOnboaringUnit);
}
