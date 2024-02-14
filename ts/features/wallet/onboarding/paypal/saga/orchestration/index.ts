import { CommonActions, StackActions } from "@react-navigation/native";
import { call } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import NavigationService from "../../../../../../navigation/NavigationService";
import ROUTES from "../../../../../../navigation/routes";
import {
  executeWorkUnit,
  withResetNavigationStack,
  WorkUnitHandler
} from "../../../../../../sagas/workUnit";
import { navigateToPayPalDetailScreen } from "../../../../../../store/actions/navigation";
import PAYPAL_ROUTES from "../../navigation/routes";
import {
  walletAddPaypalBack,
  walletAddPaypalCancel,
  walletAddPaypalCompleted,
  walletAddPaypalFailure,
  walletAddPaypalStart
} from "../../store/actions";

// handle the flow of paypal onboarding
function* paypalWorkOnboaringUnit() {
  return yield* call(executeWorkUnit, {
    startScreenNavigation: () =>
      NavigationService.dispatchNavigationAction(
        CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
          screen: PAYPAL_ROUTES.ONBOARDING.MAIN,
          params: {
            screen: PAYPAL_ROUTES.ONBOARDING.START
          }
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
  const res = yield* call<WorkUnitHandler>(
    withResetNavigationStack,
    paypalWorkOnboaringUnit
  );

  // onboarding gone successfully, go to the paypal screen detail
  if (res === "completed") {
    switch (action.payload) {
      case "payment_method_details":
        // reset the stack to land in the wallet section
        yield* call(
          NavigationService.dispatchNavigationAction,
          StackActions.popToTop()
        );
        yield* call(
          NavigationService.dispatchNavigationAction,
          navigateToPayPalDetailScreen()
        );
        break;
      // if the destination is to return back, remove 1 screen from the stack
      case "back":
        yield* call(
          NavigationService.dispatchNavigationAction,
          StackActions.pop(1)
        );
        break;
    }
  }
}
