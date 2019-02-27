/**
 * Generators to manage messages and related services.
 */

import { none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { TypeofApiCall } from "italia-ts-commons/lib/requests";
import { Task } from "redux-saga";
import {
  all,
  call,
  cancel,
  cancelled,
  Effect,
  fork,
  put,
  select,
  take
} from "redux-saga/effects";
import { ActionType, getType, isActionOf } from "typesafe-actions";

import { GetUserMessagesT } from "../../../definitions/backend/requestTypes";
import { sessionExpired } from "../../store/actions/authentication";
import {
  loadMessage as loadMessageAction,
  loadMessages as loadMessagesAction,
  loadMessagesCancel
} from "../../store/actions/messages";
import { loadService } from "../../store/actions/services";
import { messagesStateByIdSelector } from "../../store/reducers/entities/messages/messagesById";
import { servicesByIdSelector } from "../../store/reducers/entities/services/servicesById";
import { GlobalState } from "../../store/reducers/types";
import { SagaCallReturnType } from "../../types/utils";
import { uniqueItem } from "../../utils/enumerables";

/**
 * A generator to load messages from the Backend.
 * The messages returned by the Backend are filtered so the application downloads
 * only the details of the messages and services not already in the redux store.
 */
export function* loadMessages(
  getMessages: TypeofApiCall<GetUserMessagesT>
): IterableIterator<Effect> {
  // We are using try...finally to manage task cancellation
  // @https://redux-saga.js.org/docs/advanced/TaskCancellation.html
  try {
    // Load already cached messages from the store
    const cachedMessagesById: ReturnType<
      typeof messagesStateByIdSelector
    > = yield select<GlobalState>(messagesStateByIdSelector);

    // Load already cached services from the store
    const cachedServicesById: ReturnType<
      typeof servicesByIdSelector
    > = yield select<GlobalState>(servicesByIdSelector);

    // Request the list of messages from the Backend
    const response: SagaCallReturnType<typeof getMessages> = yield call(
      getMessages,
      {}
    );

    if (response && response.status === 401) {
      // on 401, expire the current session and restart the authentication flow
      yield put(sessionExpired());
      return;
    }

    /**
     * If the response is undefined (can't be decoded) or the status is not 200 dispatch a failure action
     */
    if (!response || response.status !== 200) {
      // TODO: provide status code along with message in error
      const error =
        response && response.status === 500 ? response.value.title : undefined;

      // Dispatch failure action
      yield put(loadMessagesAction.failure(error || ""));
    } else {
      yield put(
        loadMessagesAction.success(response.value.items.map(_ => _.id))
      );

      const shouldLoadMessage = (message: { id: string }) => {
        const cached = cachedMessagesById[message.id];
        return (
          cached === undefined ||
          pot.isNone(cached.message) ||
          pot.isError(cached.message)
        );
      };

      // Filter messages already in the store
      const pendingMessages = response.value.items.filter(shouldLoadMessage);

      const shouldLoadService = (id: string) =>
        cachedServicesById[id] === undefined;

      // Filter services already in the store
      const pendingServicesIds = pendingMessages
        .map(_ => _.sender_service_id)
        .filter(shouldLoadService)
        .filter(uniqueItem); // Get unique ids

      // Fetch the services detail in parallel
      // We don't need to store the results because the SERVICE_LOAD_SUCCESS is already dispatched by each `loadService` action called.
      // We fetch services first because to show messages you need the related service info
      yield all(pendingServicesIds.map(id => put(loadService.request(id))));

      // Fetch the messages detail in parallel
      // We don't need to store the results because the MESSAGE_LOAD_SUCCESS is already dispatched by each `loadMessage` action called,
      // in this way each message is stored as soon as the detail is fetched and the UI is more reactive.
      yield all(pendingMessages.map(_ => put(loadMessageAction.request(_))));
    }
  } catch (error) {
    // Dispatch failure action
    yield put(loadMessagesAction.failure(error.message));
  } finally {
    if (yield cancelled()) {
      // If the task is cancelled send a cancel message
      yield put(loadMessagesCancel());
    }
  }
}

/**
 * This generator is an 'always running' task that waits for MESSAGES_LOAD_REQUEST and MESSAGES_LOAD_CANCEL actions.
 * Instead of using takeLatest we are creating an ad-hoc while(true) loop that also manages task cancellation
 * with a custom action.
 * More info @https://github.com/redux-saga/redux-saga/blob/master/docs/advanced/Concurrency.md#takelatest
 */
export function* watchMessagesLoadOrCancelSaga(
  getMessages: TypeofApiCall<GetUserMessagesT>
): IterableIterator<Effect> {
  // We store the latest task so we can also cancel it
  // tslint:disable-next-line:no-let
  let lastTask: Option<Task> = none;
  while (true) {
    // FIXME: why not takeLatest?
    // Wait for MESSAGES_LOAD_REQUEST or MESSAGES_LOAD_CANCEL action
    const action:
      | ActionType<typeof loadMessagesAction["request"]>
      | ActionType<typeof loadMessagesCancel> = yield take([
      getType(loadMessagesAction.request),
      getType(loadMessagesCancel)
    ]);
    if (lastTask.isSome()) {
      // If there is an already running task cancel it
      yield cancel(lastTask.value);
      lastTask = none;
    }

    // If the action received is a MESSAGES_LOAD_REQUEST send the request
    // Otherwise it is a MESSAGES_LOAD_CANCEL and we just need to continue the loop
    if (isActionOf(loadMessagesAction.request, action)) {
      // Call the generator to load messages
      lastTask = some(yield fork(loadMessages, getMessages));
    }
  }
}
