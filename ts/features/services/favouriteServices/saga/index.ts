import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { addFavouriteServiceRequest } from "../store/actions";
import { loadServiceDetail } from "../../details/store/actions/details";
import { handleAddFavouriteService } from "./handleAddFavouriteService";
import { handleSyncFavouriteService } from "./handleSyncFavouriteService";

export function* watchFavouriteServicesSaga(): SagaIterator {
  yield* takeLatest(addFavouriteServiceRequest, handleAddFavouriteService);
  yield* takeLatest(loadServiceDetail.success, handleSyncFavouriteService);
}
