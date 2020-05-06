import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";
import { ServiceId } from "../../../definitions/backend/ServiceId";
import { markServiceAsRead } from "../../store/actions/services";
import { isFirstVisibleServiceLoadCompletedSelector } from "../../store/reducers/entities/services/firstServicesLoading";

/**
 * A function to check if a service is loaded for the first time (at first startup or when the cache
 * is cleaned). If true, the app shows the service list item without badge
 * @param serviceId
 */
export function* handleServiceReadabilitySaga(serviceId: string): SagaIterator {
  const isFirstVisibleServiceLoadCompleted: ReturnType<
    typeof isFirstVisibleServiceLoadCompletedSelector
  > = yield select(isFirstVisibleServiceLoadCompletedSelector);

  if (!isFirstVisibleServiceLoadCompleted) {
    yield put(markServiceAsRead(serviceId as ServiceId));
  }
}
