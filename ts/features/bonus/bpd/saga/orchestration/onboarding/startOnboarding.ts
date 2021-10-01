import { Either, right } from "fp-ts/lib/Either";
import * as pot from "italia-ts-commons/lib/pot";
import { NavigationActions } from "react-navigation";
import { SagaIterator } from "redux-saga";
import {
  call,
  CallEffect,
  Effect,
  put,
  race,
  select,
  take
} from "redux-saga/effects";
import { CitizenResource } from "../../../../../../../definitions/bpd/citizen/CitizenResource";
import ROUTES from "../../../../../../navigation/routes";
import { navigationHistoryPop } from "../../../../../../store/actions/navigationHistory";
import { fetchWalletsRequest } from "../../../../../../store/actions/wallet/wallets";
import { navigationCurrentRouteSelector } from "../../../../../../store/reducers/navigation";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { getAsyncResult } from "../../../../../../utils/saga";
import {
  navigateToBpdOnboardingDeclaration,
  navigateToBpdOnboardingInformationTos,
  navigateToBpdOnboardingLoadActivationStatus
} from "../../../navigation/actions";
import BPD_ROUTES from "../../../navigation/routes";
import { bpdLoadActivationStatus } from "../../../store/actions/details";
import {
  bpdOnboardingAcceptDeclaration,
  bpdOnboardingCancel,
  bpdUserActivate
} from "../../../store/actions/onboarding";
import { bpdEnabledSelector } from "../../../store/reducers/details/activation";

export const isLoadingScreen = (screenName: string) =>
  screenName === BPD_ROUTES.ONBOARDING.LOAD_CHECK_ACTIVATION_STATUS;

export function* getActivationStatus(): Generator<
  CallEffect,
  Either<Error, CitizenResource>,
  Either<Error, CitizenResource>
> {
  return yield call(() =>
    getAsyncResult(bpdLoadActivationStatus, undefined as void)
  );
}

export function* isBpdEnabled(): Generator<
  Effect,
  Either<Error, boolean>,
  any
> {
  const remoteActive: ReturnType<typeof bpdEnabledSelector> = yield select(
    bpdEnabledSelector
  );
  if (pot.isSome(remoteActive)) {
    return right<Error, boolean>(remoteActive.value);
  } else {
    const activationStatus: SagaCallReturnType<typeof getActivationStatus> =
      yield call(getActivationStatus);
    return activationStatus.map(citizen => citizen.enabled);
  }
}

export function* bpdStartOnboardingWorker() {
  const currentRoute: ReturnType<typeof navigationCurrentRouteSelector> =
    yield select(navigationCurrentRouteSelector);

  // go to the loading page (if I'm not on that screen)
  if (currentRoute.isSome() && !isLoadingScreen(currentRoute.value)) {
    yield put(navigateToBpdOnboardingLoadActivationStatus());

    if (currentRoute.value !== ROUTES.WALLET_HOME) {
      yield put(navigationHistoryPop(1));
    }
  }

  // read if the bpd is active for the user
  const isBpdActive: SagaCallReturnType<typeof isBpdEnabled> = yield call(
    isBpdEnabled
  );

  if (isBpdActive.isRight()) {
    // Refresh the wallets to prevent that added cards are not visible
    yield put(fetchWalletsRequest());

    yield put(navigateToBpdOnboardingInformationTos());
    yield put(navigationHistoryPop(1));

    // wait for the user that choose to continue
    yield take(bpdUserActivate);

    // Navigate to the Onboarding Declaration and wait for the action that complete the saga
    yield put(navigateToBpdOnboardingDeclaration());
    yield put(navigationHistoryPop(1));
  }

  // The saga ends when the user accepts the declaration
  yield take(bpdOnboardingAcceptDeclaration);
}

/**
 * This saga check if the bpd is active for the user and choose if start the onboarding or go directly to the bpd details
 */
export function* handleBpdStartOnboardingSaga(): SagaIterator {
  const { cancelAction } = yield race({
    onboarding: call(bpdStartOnboardingWorker),
    cancelAction: take(bpdOnboardingCancel)
  });
  if (cancelAction) {
    yield put(NavigationActions.back());
  }
}
