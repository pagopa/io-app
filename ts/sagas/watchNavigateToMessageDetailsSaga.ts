import { TypeofApiCall } from "italia-ts-commons/lib/requests";
import { Effect } from "redux-saga";
import { call, take } from "redux-saga/effects";
import { GetMessageT, GetServiceT } from "../api/backend";
import { NAVIGATE_TO_MESSAGE_DETAILS } from "../store/actions/constants";
import { navigateToMessageDetailsSaga } from "./startup/watchLoadMessagesSaga";

export function* watchNavigateToMessageDetailsSaga(
  getMessage: TypeofApiCall<GetMessageT>,
  getService: TypeofApiCall<GetServiceT>
): IterableIterator<Effect> {
  while (true) {
    const action = yield take(NAVIGATE_TO_MESSAGE_DETAILS);
    yield call(navigateToMessageDetailsSaga, getMessage, getService, action);
  }
}
