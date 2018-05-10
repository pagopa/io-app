import { call, Effect, takeLatest } from "redux-saga/effects";

import { proxyApi } from "../api";
import { SESSION_INITIALIZE_SUCCESS } from "../store/actions/constants";
import { SessionInitializeSuccess } from "../store/actions/session";

function* setBearerToken(action: SessionInitializeSuccess) {
  yield call(proxyApi.setBearerToken, action.payload);
}

export default function* root(): Iterator<Effect> {
  yield takeLatest(SESSION_INITIALIZE_SUCCESS, setBearerToken);
}
