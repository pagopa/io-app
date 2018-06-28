import { NavigationActions } from "react-navigation";
import { Effect, put, takeLatest } from "redux-saga/effects";
import { NAVIGATE_TO_DEEPLINK } from "../store/actions/constants";
import { NavigateToDeeplink } from "../store/actions/deeplink";

function* navigateToDeeplinkSaga(action: NavigateToDeeplink): Iterator<Effect> {
  yield put(NavigationActions.navigate(action.payload));
}

export default function* root(): IterableIterator<Effect> {
  yield takeLatest(NAVIGATE_TO_DEEPLINK, navigateToDeeplinkSaga);
}
