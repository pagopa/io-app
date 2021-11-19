import { call } from "redux-saga/effects";
import { NavigationActions } from "react-navigation";
import {
  executeWorkUnit,
  withResetNavigationStack
} from "../../../../../../sagas/workUnit";
import WALLET_ONBOARDING_PAYPAL_ROUTES from "../../navigation/routes";
import NavigationService from "../../../../../../navigation/NavigationService";
import {
  walletAddPaypalBack,
  walletAddPaypalCancel,
  walletAddPaypalCompleted,
  walletAddPaypalFailure
} from "../../store/actions";

function* paypalWorkUnit() {
  return yield call(executeWorkUnit, {
    // TODO check the documentation if this is the suggested way
    startScreenNavigation: () =>
      NavigationService.dispatchNavigationAction(
        NavigationActions.navigate({
          routeName: WALLET_ONBOARDING_PAYPAL_ROUTES.START
        })
      ),
    startScreenName: WALLET_ONBOARDING_PAYPAL_ROUTES.START,
    complete: walletAddPaypalCompleted,
    back: walletAddPaypalBack,
    cancel: walletAddPaypalCancel,
    failure: walletAddPaypalFailure
  });
}

export function* addPaypalToWallet() {
  yield call(withResetNavigationStack, paypalWorkUnit);
}
