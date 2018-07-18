import { NavigationActions } from "react-navigation";
import { all, Effect, put, takeLatest } from "redux-saga/effects";
import { NAVIGATE_TO_DEEPLINK } from "../store/actions/constants";
import { clearDeeplink, NavigateToDeeplink } from "../store/actions/deeplink";

function* navigateToDeeplinkSaga(action: NavigateToDeeplink): Iterator<Effect> {
  yield all([
    put(NavigationActions.navigate(action.payload)),
    put(clearDeeplink())
  ]);
}

export default function* root(): IterableIterator<Effect> {
  yield takeLatest(NAVIGATE_TO_DEEPLINK, navigateToDeeplinkSaga);
}
