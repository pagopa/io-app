import { readableReport } from "italia-ts-commons/lib/reporters";
import { call, Effect, fork, put, take } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import { buffers, channel, Channel } from "redux-saga";
import { BackendClient } from "../../api/backend";
import {
  loadServiceDetail,
  loadServicesDetail
} from "../../store/actions/services";
import { SagaCallReturnType } from "../../types/utils";
import { handleOrganizationNameUpdateSaga } from "../services/handleOrganizationNameUpdateSaga";
import { handleServiceReadabilitySaga } from "../services/handleServiceReadabilitySaga";
import { totServiceFetchWorkers } from "../../config";

/**
 * A generator to load the service details from the Backend
 *
 * @param {function} getService - The function that makes the Backend request
 * @param action
 * @returns {IterableIterator<Effect | Either<Error, ServicePublic>>}
 */
export function* loadServiceDetailRequestHandler(
  getService: ReturnType<typeof BackendClient>["getService"],
  action: ActionType<typeof loadServiceDetail["request"]>
): Generator<Effect, void, SagaCallReturnType<typeof getService>> {
  try {
    const response = yield call(getService, { service_id: action.payload });

    if (response.isLeft()) {
      throw Error(readableReport(response.value));
    }

    if (response.value.status === 200) {
      yield put(loadServiceDetail.success(response.value.value));

      // If it is occurring during the first load of serivces,
      // mark the service as read (it will not display the badge on the list item)
      yield call(handleServiceReadabilitySaga, action.payload);

      // Update, if needed, the name of the organization that provides the service
      yield call(handleOrganizationNameUpdateSaga, response.value.value);
    } else {
      throw Error(`response status ${response.value.status}`);
    }
  } catch (error) {
    yield put(loadServiceDetail.failure({ service_id: action.payload, error }));
  }
}

/**
 * A generator that listen for loadServiceDetail.request from a channel and perform the
 * handling.
 *
 * @param requestsChannel The channel where to take the loadServiceDetail.request actions
 * @param getService API call to fetch the service detail
 */
function* handleServiceLoadRequest(
  requestsChannel: Channel<ActionType<typeof loadServiceDetail.request>>,
  getService: ReturnType<typeof BackendClient>["getService"]
) {
  // Infinite loop that wait and process loadServiceDetail requests from the channel
  while (true) {
    const action: ActionType<typeof loadServiceDetail.request> = yield take(
      requestsChannel
    );
    yield call(loadServiceDetailRequestHandler, getService, action);
  }
}

/**
 * create an event channel to buffer all services detail loading requests
 * it watches for loadServicesDetail (multiple services id) and for each of them, it puts a
 * loadServiceDetail.request event into that channel
 * The workers (the handlers) will consume the channel data
 * @param getService
 */
export function* watchServicesDetailLoadSaga(
  getService: ReturnType<typeof BackendClient>["getService"]
) {
  // Create the channel used for the communication with the handlers.
  const requestsChannel: Channel<ActionType<
    typeof loadServiceDetail.request
  >> = yield call(channel, buffers.expanding());

  // fork the handlers
  // eslint-disable-next-line
  for (let i = 0; i < totServiceFetchWorkers; i++) {
    yield fork(handleServiceLoadRequest, requestsChannel, getService);
  }

  while (true) {
    // Take the loadService request action and put back in the channel
    // to be processed by the handlers.
    const action: ActionType<typeof loadServicesDetail> = yield take(
      getType(loadServicesDetail)
    );
    action.payload.forEach((serviceId: string) =>
      requestsChannel.put(loadServiceDetail.request(serviceId))
    );
  }
}
