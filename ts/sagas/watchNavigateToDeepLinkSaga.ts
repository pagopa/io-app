import { NavigationActions, StackActions } from "react-navigation";
import { all, call, put, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import NavigationService from "../navigation/NavigationService";

import { clearDeepLink, navigateToDeepLink } from "../store/actions/deepLink";
import { ReduxSagaEffect } from "../types/utils";

export function* watchNavigateToDeepLinkSaga(): IterableIterator<ReduxSagaEffect> {
  yield* takeLatest(
    getType(navigateToDeepLink),
    function* (
      action: ActionType<typeof navigateToDeepLink>,
      replace: boolean = false
    ) {
      const payload = action.payload;
      const navigationAction =
        replace && payload.key !== undefined
          ? StackActions.replace({
              routeName: payload.routeName,
              params: payload.params,
              action: payload.action,
              key: payload.key
            })
          : NavigationActions.navigate(action.payload);

      yield* all([
        call(NavigationService.dispatchNavigationAction, navigationAction),
        put(clearDeepLink())
      ]);
    }
  );
}
