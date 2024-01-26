import { StackActions } from "@react-navigation/native";
import * as E from "fp-ts/lib/Either";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { call, put, select, take, race } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { pipe } from "fp-ts/lib/function";
import NavigationService from "../../../../../../navigation/NavigationService";
import { navigateBack } from "../../../../../../store/actions/navigation";
import { fetchWalletsRequest } from "../../../../../../store/actions/wallet/wallets";
import {
  ReduxSagaEffect,
  SagaCallReturnType
} from "../../../../../../types/utils";
import { getAsyncResult } from "../../../../../../utils/saga";
import { bpdLoadActivationStatus } from "../../../store/actions/details";
import {
  bpdOnboardingAcceptDeclaration,
  bpdOnboardingCancel,
  bpdUserActivate
} from "../../../store/actions/onboarding";
import { bpdEnabledSelector } from "../../../store/reducers/details/activation";

export const isLoadingScreen = () => true;

export function* getActivationStatus() {
  return yield* call(() => getAsyncResult(bpdLoadActivationStatus, undefined));
}

export function* isBpdEnabled(): Generator<
  ReduxSagaEffect,
  E.Either<Error, boolean>,
  any
> {
  const remoteActive: ReturnType<typeof bpdEnabledSelector> = yield* select(
    bpdEnabledSelector
  );
  if (pot.isSome(remoteActive)) {
    return E.right<Error, boolean>(remoteActive.value);
  } else {
    const activationStatus = yield* call(getActivationStatus);
    return pipe(
      activationStatus,
      E.map(citizen => citizen.enabled)
    );
  }
}

/**
 *  Old style orchestrator, please don't use this as reference for future development
 *  @deprecated
 */
export function* bpdStartOnboardingWorker() {
  const currentRoute: ReturnType<typeof NavigationService.getCurrentRouteName> =
    yield* call(NavigationService.getCurrentRouteName);

  // go to the loading page (if I'm not on that screen)
  if (currentRoute !== undefined && !isLoadingScreen()) {
    throw new Error("Not in the loading screen");
  }

  // read if the bpd is active for the user
  const isBpdActive: SagaCallReturnType<typeof isBpdEnabled> = yield* call(
    isBpdEnabled
  );

  if (E.isRight(isBpdActive)) {
    // Refresh the wallets to prevent that added cards are not visible
    yield* put(fetchWalletsRequest());

    // wait for the user that choose to continue
    yield* take(bpdUserActivate);

    // Navigate to the Onboarding Declaration and wait for the action that complete the saga
  }

  // The saga ends when the user accepts the declaration
  yield* take(bpdOnboardingAcceptDeclaration);
}

/**
 * This saga check if the bpd is active for the user and choose if start the onboarding or go directly to the bpd details
 */
export function* handleBpdStartOnboardingSaga() {
  const { cancelAction } = yield* race({
    onboarding: call(bpdStartOnboardingWorker),
    cancelAction:
      take<ActionType<typeof bpdOnboardingCancel>>(bpdOnboardingCancel)
  });

  if (cancelAction) {
    yield* call(
      NavigationService.dispatchNavigationAction,
      StackActions.popToTop()
    );
    yield* call(navigateBack);
  }
}
