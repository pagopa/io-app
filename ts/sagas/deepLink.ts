import { NavigationActions } from "react-navigation";
import { all, Effect, put, takeLatest } from "redux-saga/effects";
import { NAVIGATE_TO_DEEPLINK } from "../store/actions/constants";
import { clearDeepLink, NavigateToDeepLink } from "../store/actions/deepLink";

function* navigateToDeepLinkSaga(action: NavigateToDeepLink): Iterator<Effect> {
  yield all([
    put(NavigationActions.navigate(action.payload)),
    put(clearDeepLink())
  ]);
}

export default function* root(): IterableIterator<Effect> {
  yield takeLatest(NAVIGATE_TO_DEEPLINK, navigateToDeepLinkSaga);
}
