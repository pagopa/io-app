import { call } from "redux-saga/effects";
import { NavigationActions, StackActions } from "react-navigation";
import { ActionType } from "typesafe-actions";
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
  walletAddPaypalFailure,
  walletAddPaypalStart
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

export function* addPaypalToWallet(
  action: ActionType<typeof walletAddPaypalStart>
) {
  const res: SagaCallReturnType<typeof executeWorkUnit> = yield call(
    withResetNavigationStack,
    paypalWorkOnboaringUnit
  );
  // onboarding gone successfully, go to the paypal screen detail
  if (res === "completed") {
    switch (action.payload) {
      case "payment_method_details":
        // reset the stack to land in the wallet section
        yield call(
          NavigationService.dispatchNavigationAction,
          StackActions.popToTop()
        );
        yield call(
          NavigationService.dispatchNavigationAction,
          navigateToPayPalDetailScreen()
        );
        break;
      // if the destination if to return back, remove 1 screen from the stack
      case "back":
        yield call(
          NavigationService.dispatchNavigationAction,
          StackActions.pop({ n: 1 })
        );
        break;
    }
  }
}
