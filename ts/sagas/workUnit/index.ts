import { NavigationActions, NavigationNavigateAction } from "react-navigation";
import { call, Effect, put, select, take } from "redux-saga/effects";
import {
  ActionCreator,
  ActionType,
  getType,
  isActionOf,
  TypeConstant
} from "typesafe-actions";
import { navigationHistoryPop } from "../../store/actions/navigationHistory";
import { navigationHistorySizeSelector } from "../../store/middlewares/navigationHistory";
import { navigationCurrentRouteSelector } from "../../store/reducers/navigation";

export type WorkUnit = {
  startScreenNavigation: NavigationNavigateAction;
  startScreenName: string;
  complete: ActionCreator<TypeConstant>;
  cancel: ActionCreator<TypeConstant>;
  back: ActionCreator<TypeConstant>;
};

export enum ESagaResult {
  Cancel = "Cancel",
  Completed = "Completed",
  Back = "Back"
}

function* ensureScreen(
  navigateTo: NavigationNavigateAction,
  startScreen: string
) {
  const currentRoute: ReturnType<typeof navigationCurrentRouteSelector> = yield select(
    navigationCurrentRouteSelector
  );

  if (currentRoute.isSome() && currentRoute.value !== startScreen) {
    yield put(navigateTo);
  }
}

/**
 * Ensure that after the execution of the saga `g`, the navigation stacks return to the first screen
 * before the call.
 * @param g
 */
export function* withResetNavigationStack<T>(
  g: (...args: Array<any>) => Generator<Effect, T>
): Generator<Effect, T, any> {
  const currentNavigationStackSize: ReturnType<typeof navigationHistorySizeSelector> = yield select(
    navigationHistorySizeSelector
  );
  const res: T = yield call(g);
  const newNavigationStackSize: ReturnType<typeof navigationHistorySizeSelector> = yield select(
    navigationHistorySizeSelector
  );
  const deltaNavigation = newNavigationStackSize - currentNavigationStackSize;
  if (deltaNavigation > 1) {
    yield put(navigationHistoryPop(deltaNavigation - 1));
  }
  yield put(NavigationActions.back());
  console.log("withReset" + res);
  return res;
}

export function* executeWorkUnit(
  wu: WorkUnit
): Generator<
  Effect,
  ESagaResult,
  ActionType<typeof wu.cancel | typeof wu.complete | typeof wu.back>
> {
  yield call(ensureScreen, wu.startScreenNavigation, wu.startScreenName);

  const result = yield take([
    getType(wu.complete),
    getType(wu.cancel),
    getType(wu.back)
  ]);

  if (isActionOf(wu.complete, result)) {
    return ESagaResult.Completed;
  } else if (isActionOf(wu.cancel, result)) {
    return ESagaResult.Cancel;
  } else if (isActionOf(wu.back, result)) {
    return ESagaResult.Back;
  }
  throw new Error(`Unhandled case for ${result}`);
}
