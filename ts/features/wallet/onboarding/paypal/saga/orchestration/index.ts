import { call, select } from "redux-saga/effects";
import * as pot from "italia-ts-commons/lib/pot";
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
import { SagaCallReturnType } from "../../../../../../types/utils";
import { paypalSelector } from "../../../../../../store/reducers/wallet/wallets";
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
  if (res === "completed") {
    const paypal: ReturnType<typeof paypalSelector> = yield select(
      paypalSelector
    );
    if (pot.isSome(paypal)) {
      yield call(
        NavigationService.dispatchNavigationAction,
        navigateToPayPalDetailScreen(paypal.value)
      );
    }
  }
}
