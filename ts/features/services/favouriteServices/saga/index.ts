import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { addFavouriteServiceRequest } from "../store/actions";
import { handleAddFavouriteService } from "./handleAddFavouriteService";

export function* watchFavouriteServicesSaga(): SagaIterator {
  yield* takeLatest(addFavouriteServiceRequest, handleAddFavouriteService);
}
