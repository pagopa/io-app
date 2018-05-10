import { call, Effect, takeLatest } from "redux-saga/effects";

import { proxyApi } from "../api/api";
import { LOGIN_SUCCESS } from "../store/actions/constants";
import { LoginSuccess } from "../store/actions/session";

function* setBearerToken(action: LoginSuccess) {
  yield call(proxyApi.setBearerToken, action.payload);
}

export default function* root(): Iterator<Effect> {
  yield takeLatest(LOGIN_SUCCESS, setBearerToken);
}
