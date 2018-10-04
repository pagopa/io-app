import { NavigationActions, StackActions } from "react-navigation";
import { all, Effect, put, takeLatest } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";

import { clearDeepLink, navigateToDeepLink } from "../store/actions/deepLink";

export function* watchNavigateToDeepLinkSaga(): IterableIterator<Effect> {
  yield takeLatest(getType(navigateToDeepLink), function*(
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

    yield all([put(navigationAction), put(clearDeepLink())]);
  });
}
