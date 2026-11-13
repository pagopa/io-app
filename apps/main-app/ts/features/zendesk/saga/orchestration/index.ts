import { CommonActions } from "@react-navigation/native";
import { SagaIterator } from "redux-saga";
import { call } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";

import NavigationService from "../../../../navigation/NavigationService";
import ROUTES from "../../../../navigation/routes";
import { zendeskSupportStart } from "../../store/actions";
import { zendeskSupportWorker } from "./zendeskSupportWorker";

export function* zendeskSupport(
  zendeskStart: ActionType<typeof zendeskSupportStart>
): SagaIterator {
  const navigator = yield* call(NavigationService.getNavigator);
  const initialState = navigator.current?.getRootState();

  const result = yield* call(zendeskSupportWorker, zendeskStart);

  if (initialState !== undefined) {
    yield* resetNavigationTo(initialState);
  }

  if (result === "failure") {
    yield* call(NavigationService.navigate, ROUTES.WORKUNIT_GENERIC_FAILURE);
  }

  return result;
}

function* resetNavigationTo(state: Parameters<typeof CommonActions.reset>[0]) {
  yield* call(
    NavigationService.dispatchNavigationAction,
    CommonActions.reset(state)
  );
}
