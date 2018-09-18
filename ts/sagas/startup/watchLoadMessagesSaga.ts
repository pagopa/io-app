/**
 * Generators to manage messages and related services.
 */

import { Either, left, right } from "fp-ts/lib/Either";
import { none, Option, some } from "fp-ts/lib/Option";
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

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { GetMessagesT, GetMessageT, GetServiceT } from "../../api/backend";
import { sessionExpired } from "../../store/actions/authentication";
import {
  MESSAGES_LOAD_CANCEL,
  MESSAGES_LOAD_REQUEST
} from "../../store/actions/constants";
import {
  loadMessageFailure,
  loadMessagesCancel,
  loadMessagesFailure,
  loadMessagesSuccess,
  loadMessageSuccess,
  MessagesLoadCancel,
  MessagesLoadRequest
} from "../../store/actions/messages";
import {
  loadServiceFailure,
  loadServiceSuccess
} from "../../store/actions/services";
import {
  messageByIdSelector,
  messagesByIdSelector
} from "../../store/reducers/entities/messages/messagesById";
import {
  serviceByIdSelector,
  servicesByIdSelector
} from "../../store/reducers/entities/services/servicesById";
import {
  MessageWithContentPO,
  toMessageWithContentPO
} from "../../types/MessageWithContentPO";
import { SagaCallReturnType } from "../../types/utils";

/**
 * A generator to load the message detail from the Backend
 *
 * @param {function} getMessage - The function that makes the Backend request
 * @param {string} id - The id of the message to load
 * @returns {IterableIterator<Effect | Error | MessageWithContentPO>}
 */
export function* loadMessage(
  getMessage: TypeofApiCall<GetMessageT>,
  id: string
): IterableIterator<Effect | Either<Error, MessageWithContentPO>> {
  // If we already have the message in the store just return it
  const cachedMessage: ReturnType<
    ReturnType<typeof messageByIdSelector>
  > = yield select(messageByIdSelector(id));
  if (cachedMessage) {
    return right(cachedMessage);
  }

  const response: SagaCallReturnType<typeof getMessage> = yield call(
    getMessage,
    { id }
  );

  if (!response || response.status !== 200) {
    const error: Error = response ? response.value : Error();
    yield put(loadMessageFailure(error));
    return left(error);
  }

  // Trigger an action to store the new message (converted to plain object) and return it
  const messageWithContentPO = toMessageWithContentPO(response.value);
  yield put(loadMessageSuccess(messageWithContentPO));
  return right(messageWithContentPO);
}

/**
 * A generator to load the service details from the Backend
 *
 * @param {function} getService - The function that makes the Backend request
 * @param {string} id - The id of the service to load
 * @returns {IterableIterator<Effect | Either<Error, ServicePublic>>}
 */
export function* loadService(
  getService: TypeofApiCall<GetServiceT>,
  id: string
): IterableIterator<Effect | Either<Error, ServicePublic>> {
  // If we already have the service in the store just return it
  const cachedService: ReturnType<
    ReturnType<typeof serviceByIdSelector>
  > = yield select(serviceByIdSelector(id));
  if (cachedService) {
    return right(cachedService);
  }

  const response: SagaCallReturnType<typeof getService> = yield call(
    getService,
    { id }
  );

  if (!response || response.status !== 200) {
    const error: Error = response ? response.value : Error();
    yield put(loadServiceFailure(error));
    return left(error);
  }

  // Trigger an action to store the new service and return it
  yield put(loadServiceSuccess(response.value));
  return right(response.value);
}

/**
 * A generator to load messages from the Backend.
 * The messages returned by the Backend are filtered so the application downloads
 * only the details of the messages and services not already in the redux store.
 */
export function* loadMessages(
  getMessages: TypeofApiCall<GetMessagesT>,
  getMessage: TypeofApiCall<GetMessageT>,
  getService: TypeofApiCall<GetServiceT>
): IterableIterator<Effect> {
  // We are using try...finally to manage task cancellation
  // @https://redux-saga.js.org/docs/advanced/TaskCancellation.html
  try {
    // Load already cached messages from the store
    const cachedMessagesById: ReturnType<
      typeof messagesByIdSelector
    > = yield select(messagesByIdSelector);

    // Load already cached services from the store
    const cachedServicesById: ReturnType<
      typeof servicesByIdSelector
    > = yield select(servicesByIdSelector);

    // Request the list of messages from the Backend
    const response: SagaCallReturnType<typeof getMessages> = yield call(
      getMessages,
      {}
    );

    if (response && response.status === 401) {
      // on 401, expire the current session and restart the authentication flow
      yield put(sessionExpired);
      return;
    }

    /**
     * If the response is undefined (can't be decoded) or the status is not 200 dispatch a failure action
     */
    if (!response || response.status !== 200) {
      const error: Error = response ? response.value : Error();

      // Dispatch failure action
      yield put(loadMessagesFailure(error));
    } else {
      // Filter messages already in the store
      const newMessagesWithoutContent = response.value.items.filter(
        message => !cachedMessagesById.hasOwnProperty(message.id)
      );

      // Get the messages ids list
      const newMessagesIds = newMessagesWithoutContent.map(
        message => message.id
      );

      // Filter services already in the store
      const newServicesIds = newMessagesWithoutContent
        .map(message => message.sender_service_id)
        .filter(id => !cachedServicesById.hasOwnProperty(id))
        .filter((id, index, ids) => index === ids.indexOf(id)); // Get unique ids

      // Fetch the services detail in parallel
      // We don't need to store the results because the SERVICE_LOAD_SUCCESS is already dispatched by each `loadService` action called.
      // We fetch services first because to show messages you need the related service info
      yield all(newServicesIds.map(id => call(loadService, getService, id)));

      // Fetch the messages detail in parallel
      // We don't need to store the results because the MESSAGE_LOAD_SUCCESS is already dispatched by each `loadMessage` action called,
      // in this way each message is stored as soon as the detail is fetched and the UI is more reactive.
      yield all(newMessagesIds.map(id => call(loadMessage, getMessage, id)));

      yield put(loadMessagesSuccess());
    }
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
  getMessages: TypeofApiCall<GetMessagesT>,
  getMessage: TypeofApiCall<GetMessageT>,
  getService: TypeofApiCall<GetServiceT>
): IterableIterator<Effect> {
  // We store the latest task so we can also cancel it
  // tslint:disable-next-line:no-let
  let lastTask: Option<Task> = none;
  while (true) {
    // FIXME: why not takeLatest?
    // Wait for MESSAGES_LOAD_REQUEST or MESSAGES_LOAD_CANCEL action
    const action: MessagesLoadRequest | MessagesLoadCancel = yield take([
      MESSAGES_LOAD_REQUEST,
      MESSAGES_LOAD_CANCEL
    ]);
    if (lastTask.isSome()) {
      // If there is an already running task cancel it
      yield cancel(lastTask.value);
      lastTask = none;
    }

    // If the action received is a MESSAGES_LOAD_REQUEST send the request
    // Otherwise it is a MESSAGES_LOAD_CANCEL and we just need to continue the loop
    if (action.type === MESSAGES_LOAD_REQUEST) {
      // Call the generator to load messages
      lastTask = some(
        yield fork(loadMessages, getMessages, getMessage, getService)
      );
    }
  }
}
