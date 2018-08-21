/**
 * Generators to manage messages and related services.
 */

import { none, Option, some } from "fp-ts/lib/Option";
import { TypeofApiCall } from "italia-ts-commons/lib/requests";
import { Alert } from "react-native";
import { NavigationNavigateActionPayload } from "react-navigation";
import { NavigationActions } from "react-navigation";
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
  take,
  takeLatest
} from "redux-saga/effects";

import ROUTES from "../../navigation/routes";

import { GetMessagesT, GetMessageT, GetServiceT } from "../../api/backend";

import { MessageWithContent } from "../../../definitions/backend/MessageWithContent";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";

import { sessionExpired } from "../../store/actions/authentication";
import {
  MESSAGES_LOAD_CANCEL,
  MESSAGES_LOAD_REQUEST,
  NAVIGATE_TO_MESSAGE_DETAILS
} from "../../store/actions/constants";
import {
  loadMessageFailure,
  loadMessagesCancel,
  loadMessagesFailure,
  loadMessagesSuccess,
  loadMessageSuccess,
  MessagesLoadCancel,
  MessagesLoadRequest,
  NavigateToMessageDetails
} from "../../store/actions/messages";
import { loadServiceSuccess } from "../../store/actions/services";
import {
  messageByIdSelector,
  messagesByIdSelector
} from "../../store/reducers/entities/messages/messagesById";
import {
  serviceByIdSelector,
  servicesByIdSelector
} from "../../store/reducers/entities/services/servicesById";

import { toMessageWithContentPO } from "../../types/MessageWithContentPO";
import { SagaCallReturnType } from "../../types/utils";

/**
 * A generator to load the message detail from the Backend
 *
 * @param {function} getMessage - The function that makes the Backend request
 * @param {string} id - The id of the message to load
 * @returns {IterableIterator<Effect | Error | MessageWithContent>}
 */
export function* loadMessage(
  getMessage: TypeofApiCall<GetMessageT>,
  id: string
): IterableIterator<Effect | Error | MessageWithContent> {
  const response: SagaCallReturnType<typeof getMessage> = yield call(
    getMessage,
    { id }
  );

  if (!response || response.status !== 200) {
    const error: Error = response ? response.value : Error();
    yield put(loadMessageFailure(error));
    return error;
  }
  // Trigger an action to store the new message (converted to plain object)
  yield put(loadMessageSuccess(toMessageWithContentPO(response.value)));
  return response.value;
}

export function* navigateToMessageDetailsSaga(
  getMessage: TypeofApiCall<GetMessageT>,
  getService: TypeofApiCall<GetServiceT>,
  action: NavigateToMessageDetails
): Iterator<Effect> {
  const messageId = action.payload;

  const messageIdSelector = messageByIdSelector(messageId);

  // tslint:disable-next-line:no-let
  let message: ReturnType<typeof messageIdSelector> = yield select(
    messageIdSelector
  );

  if (!message) {
    try {
      yield call(loadMessage, getMessage, messageId);
      const loadedMessage: ReturnType<typeof messageIdSelector> = yield select(
        messageIdSelector
      );
      message = loadedMessage;
    } catch (err) {
      // FIXME: do not show alerts to user, instead show a user friendly
      // explanation of what happened
      Alert.alert(
        "An error occured while loading message",
        JSON.stringify(err)
      );
    }
  }

  // if still no message, bail out now
  if (!message) {
    return;
  }

  const serviceIdSelector = serviceByIdSelector(message.sender_service_id);
  const senderService: ReturnType<typeof serviceIdSelector> = yield select(
    serviceIdSelector
  );

  if (!senderService) {
    yield call(loadService, getService, message.sender_service_id);
  }

  const navigationPayload: NavigationNavigateActionPayload = {
    routeName: ROUTES.MESSAGE_DETAILS,
    params: { message, senderService }
  };

  yield put(NavigationActions.navigate(navigationPayload));
}

export function* watchNavigateToMessageDetailsSaga(
  getMessage: TypeofApiCall<GetMessageT>,
  getService: TypeofApiCall<GetServiceT>
): IterableIterator<Effect> {
  yield takeLatest(
    NAVIGATE_TO_MESSAGE_DETAILS,
    navigateToMessageDetailsSaga,
    getMessage,
    getService
  );
}

/**
 * A generator to load the service details from the Backend
 *
 * @param {function} getService - The function that makes the Backend request
 * @param {string} id - The id of the service to load
 * @returns {IterableIterator<Effect | Error | ServicePublic>}
 */
export function* loadService(
  getService: TypeofApiCall<GetServiceT>,
  id: string
): IterableIterator<Effect | Error | ServicePublic> {
  const response: SagaCallReturnType<typeof getService> = yield call(
    getService,
    { id }
  );

  if (!response || response.status !== 200) {
    return response ? response.value : Error();
  } else {
    // Trigger an action to store the new service
    yield put(loadServiceSuccess(response.value));
    return response.value;
  }
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
