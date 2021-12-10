// watch for all actions regarding paypal
import { takeLatest } from "redux-saga/effects";
import { zendeskSupportStart } from "../store/actions";
import { zendeskSupport } from "./orchestration";

export function* watchZendeskSupportSaga() {
  // start zendesk support management
  yield takeLatest(zendeskSupportStart, zendeskSupport);
}
