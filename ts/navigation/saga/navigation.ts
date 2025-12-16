import { call, delay } from "typed-redux-saga/macro";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import NavigationService from "../NavigationService";
import {
  trackMainNavigatorStackReadyOk,
  trackMainNavigatorStackReadyTimeout,
  trackNavigationServiceInitializationCompleted,
  trackNavigationServiceInitializationTimeout
} from "../analytics/navigation";

const navigatorPollingTime = 125 as Millisecond;
const warningWaitNavigatorTime = 2000 as Millisecond;

/**
 * Wait until the {@link NavigationService} is initialized.
 * The NavigationService is initialized when is called {@link RootContainer} componentDidMount and the ref is set with setTopLevelNavigator
 */
export function* waitForNavigatorServiceInitialization() {
  // eslint-disable-next-line functional/no-let
  let isNavigatorReady: ReturnType<
    typeof NavigationService.getIsNavigationReady
  > = yield* call(NavigationService.getIsNavigationReady);

  // eslint-disable-next-line functional/no-let
  let timeoutLogged = false;

  const startTime = performance.now();

  // before continuing we must wait for the navigatorService to be ready
  while (!isNavigatorReady) {
    const elapsedTime = performance.now() - startTime;
    if (!timeoutLogged && elapsedTime >= warningWaitNavigatorTime) {
      timeoutLogged = true;

      yield* call(trackNavigationServiceInitializationTimeout);
    }
    yield* delay(navigatorPollingTime);
    isNavigatorReady = yield* call(NavigationService.getIsNavigationReady);
  }

  const initTime = performance.now() - startTime;

  yield* call(trackNavigationServiceInitializationCompleted, initTime);
}

export function* waitForMainNavigator() {
  // eslint-disable-next-line functional/no-let
  let isMainNavReady = yield* call(NavigationService.getIsMainNavigatorReady);

  // eslint-disable-next-line functional/no-let
  let timeoutLogged = false;
  const startTime = performance.now();

  // before continuing we must wait for the main navigator tack to be ready
  while (!isMainNavReady) {
    const elapsedTime = performance.now() - startTime;
    if (!timeoutLogged && elapsedTime >= warningWaitNavigatorTime) {
      timeoutLogged = true;

      yield* call(trackMainNavigatorStackReadyTimeout);
    }
    yield* delay(navigatorPollingTime);
    isMainNavReady = yield* call(NavigationService.getIsMainNavigatorReady);
  }

  const initTime = performance.now() - startTime;

  yield* call(trackMainNavigatorStackReadyOk, initTime);
}
