import { NavigationActions } from "react-navigation";
import { SagaIterator } from "redux-saga";
import { call, put, race, select, take } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { navigationHistoryPop } from "../../../../../store/actions/navigationHistory";
import { navigationCurrentRouteSelector } from "../../../../../store/reducers/navigation";
import {
  navigateToBpdIbanInsertion,
  navigateToBpdIbanKOWrong
} from "../../navigation/action/iban";
import { navigateToBpdOnboardingEnrollPaymentMethod } from "../../navigation/action/onboarding";
import BPD_ROUTES from "../../navigation/routes";
import {
  bpdIbanInsertionCancel,
  bpdIbanInsertionContinue,
  bpdIbanInsertionStart,
  bpdUpsertIban,
  IBANInsertionSource
} from "../../store/actions/iban";
import { IbanStatus } from "../networking/patchCitizenIban";

export const chooseContinueAction = (source: IBANInsertionSource) => {
  switch (source) {
    case IBANInsertionSource.DETAILS:
      return NavigationActions.back;
    case IBANInsertionSource.ONBOARDING:
      // TODO change with an action that triggers a saga that choose which screen to display
      //  based on the cards present or not
      return navigateToBpdOnboardingEnrollPaymentMethod;
    default:
      throw new Error(`${source} not handled!`);
  }
};

export const chooseNextScreen = (
  ibantype: IbanStatus,
  source: IBANInsertionSource
) => {
  switch (ibantype) {
    case IbanStatus.OK:
      return chooseContinueAction(source);
    case IbanStatus.NOT_VALID:
      return navigateToBpdIbanKOWrong;
    default:
      throw new Error(`${ibantype} not handled!`);
  }
};

export const isMainScreen = (screenName: string) =>
  screenName === BPD_ROUTES.IBAN.INSERTION;

function* ensureMainScreen() {
  const currentRoute: ReturnType<typeof navigationCurrentRouteSelector> = yield select(
    navigationCurrentRouteSelector
  );

  if (currentRoute.isSome() && !isMainScreen(currentRoute.value)) {
    yield put(navigateToBpdIbanInsertion());
    yield put(navigationHistoryPop(1));
  }
}

export function* bpdIbanInsertionWorker(source: IBANInsertionSource) {
  // ensure the first screen of the saga is the iban insertion screen.
  yield call(ensureMainScreen);
  // wait for the user iban insertion
  const result: ActionType<typeof bpdUpsertIban.success> = yield take(
    bpdUpsertIban.success
  );
  const nextNavigation = chooseNextScreen(result.payload.status, source);
  yield put(nextNavigation());
}

/**
 * This saga start the workflow that allows the user to insert / modify the IBAN associated to bpd.
 */
export function* handleBpdIbanInsertion(
  action: ActionType<typeof bpdIbanInsertionStart>
): SagaIterator {
  const triggerType = action.payload;
  const { cancelAction, continueAction } = yield race({
    enroll: call(bpdIbanInsertionWorker, triggerType),
    cancelAction: take(bpdIbanInsertionCancel),
    continueAction: take(bpdIbanInsertionContinue)
  });
  // the user chooses to abort the operation, return to the previous screen.
  if (cancelAction) {
    yield put(NavigationActions.back());
  }
  // the user chooses to continue, navigate to the appropriate section based on the triggering flow.
  else if (continueAction) {
    switch (triggerType) {
      case IBANInsertionSource.DETAILS:
        yield put(NavigationActions.back());
        break;
      case IBANInsertionSource.ONBOARDING:
        // TODO change with an action that triggers a saga that choose which screen to display
        //  based on the cards present or not
        yield put(navigateToBpdOnboardingEnrollPaymentMethod());
        break;
      default:
        throw new Error(`${triggerType} not handled!`);
    }
  }
}
