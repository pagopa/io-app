import { Effect, put } from "redux-saga/effects";

import { NavigationActions } from "react-navigation";
import ROUTES from "../../navigation/routes";

export function* forceUpdateSaga(
  minAppVersion: number,
  appVersion: number
): IterableIterator<Effect> {
  if (minAppVersion > appVersion) {
    yield put(
      NavigationActions.navigate({
        routeName: ROUTES.FORCE_UPDATE_APP
      })
    );
    return true;
  } else {
    return false;
  }
}
