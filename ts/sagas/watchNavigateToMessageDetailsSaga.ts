import { TypeofApiCall } from "italia-ts-commons/lib/requests";
import { Effect } from "redux-saga";
import { takeEvery } from "redux-saga/effects";
import { GetMessageT, GetServiceT } from "../api/backend";
import { NAVIGATE_TO_MESSAGE_DETAILS } from "../store/actions/constants";
import { navigateToMessageDetailsSaga } from "./startup/watchLoadMessagesSaga";

export function* watchNavigateToMessageDetailsSaga(
  getMessage: TypeofApiCall<GetMessageT>,
  getService: TypeofApiCall<GetServiceT>
): IterableIterator<Effect> {
  yield takeEvery(
    NAVIGATE_TO_MESSAGE_DETAILS,
    navigateToMessageDetailsSaga,
    getMessage,
    getService
  );
}
