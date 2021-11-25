import { call } from "redux-saga/effects";
import { NavigationActions, StackActions } from "react-navigation";
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
import { SagaCallReturnType } from "../../../../../../types/utils";
import { navigateToPayPalDetailScreen } from "../../../../../../store/actions/navigation";

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
  const res: SagaCallReturnType<typeof executeWorkUnit> = yield call(
    withResetNavigationStack,
    paypalWorkOnboaringUnit
  );
  // onboarding gone successfully, go to the paypal screen detail
  if (res === "completed") {
    yield call(
      NavigationService.dispatchNavigationAction,
      StackActions.popToTop()
    );
    yield call(
      NavigationService.dispatchNavigationAction,
      navigateToPayPalDetailScreen()
    );
  }
}
