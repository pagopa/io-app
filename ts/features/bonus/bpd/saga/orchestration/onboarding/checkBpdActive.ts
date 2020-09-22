import { Either, left, right } from "fp-ts/lib/Either";
import { NavigationActions } from "react-navigation";
import { SagaIterator } from "redux-saga";
import { call, Effect, put, race, select, take } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import { navigateToWalletHome } from "../../../../../../store/actions/navigation";
import { navigationHistoryPop } from "../../../../../../store/actions/navigationHistory";
import { navigationCurrentRouteSelector } from "../../../../../../store/reducers/navigation";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { isReady } from "../../../model/RemoteValue";
import {
  navigateToBpdOnboardingDeclaration,
  navigateToBpdOnboardingInformationTos,
  navigateToBpdOnboardingLoadActivationStatus
} from "../../../navigation/action";
import BPD_ROUTES from "../../../navigation/routes";
import { loadBdpActivationStatus } from "../../../store/actions/details";
import { BpdOnboardingCancel } from "../../../store/actions/onboarding";
import { bpdActiveSelector } from "../../../store/reducers/details";

export const isLoadingScreen = (screenName: string) =>
  screenName === BPD_ROUTES.ONBOARDING.LOAD_CHECK_ACTIVATION_STATUS;

export function* isBpdEnabled(): Generator<
  Effect,
  Either<Error, boolean>,
  any
> {
  const remoteActive: ReturnType<typeof bpdActiveSelector> = yield select(
    bpdActiveSelector
  );
  if (isReady(remoteActive)) {
    return right<Error, boolean>(remoteActive.value);
  } else {
    yield put(loadBdpActivationStatus.request());
    const bpdActivationResults: ActionType<
      | typeof loadBdpActivationStatus.success
      | typeof loadBdpActivationStatus.failure
    > = yield take([
      getType(loadBdpActivationStatus.success),
      getType(loadBdpActivationStatus.failure)
    ]);
    return bpdActivationResults.type ===
      getType(loadBdpActivationStatus.success)
      ? right<Error, boolean>(bpdActivationResults.payload)
      : left<Error, boolean>(bpdActivationResults.payload);
  }
}

export function* bpdCheckActiveWorker() {
  const currentRoute: ReturnType<typeof navigationCurrentRouteSelector> = yield select(
    navigationCurrentRouteSelector
  );

  if (currentRoute.isSome() && !isLoadingScreen(currentRoute.value)) {
    // show the loading page for the check eligibility
    yield put(navigateToBpdOnboardingLoadActivationStatus());
    yield put(navigationHistoryPop(1));
  }

  const isBpdActive: SagaCallReturnType<typeof isBpdEnabled> = yield call(
    isBpdEnabled
  );

  if (isBpdActive.isRight()) {
    if (isBpdActive) {
      // TODO: navigate to bpd details
      yield put(navigateToWalletHome());
      yield put(navigationHistoryPop(1));
    } else {
      yield put(navigateToBpdOnboardingInformationTos());
      yield put(navigationHistoryPop(1));
      // TODO: wait for continue
      yield put(navigateToBpdOnboardingDeclaration());
      yield put(navigationHistoryPop(1));
    }
  }
}

export function* handleBpdCheckActiveSaga(): SagaIterator {
  const { cancelAction } = yield race({
    onboarding: call(bpdCheckActiveWorker),
    cancelAction: take(BpdOnboardingCancel)
  });
  if (cancelAction) {
    yield put(NavigationActions.back());
  }
}
