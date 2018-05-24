/**
 * Generators to manage messages and related services.
 */

import { BasicResponseType } from "italia-ts-commons/lib/requests";
import { all, call, Effect, put, select, takeLatest } from "redux-saga/effects";

import { Messages } from "../../definitions/backend/Messages";
import { MessageWithContent } from "../../definitions/backend/MessageWithContent";
import { ServicePublic } from "../../definitions/backend/ServicePublic";
import { BackendClient } from "../api/backend";
import { apiUrlPrefix } from "../config";
import { MESSAGES_LOAD_REQUEST } from "../store/actions/constants";
import {
  loadMessagesFailure,
  loadMessagesSuccess,
  loadMessageSuccess
} from "../store/actions/messages";
import { loadServiceSuccess } from "../store/actions/services";
import { messagesByIdSelectors } from "../store/reducers/entities/messages/messagesById";
import { servicesByIdSelector } from "../store/reducers/entities/services/servicesById";
import { sessionTokenSelector } from "../store/reducers/session";

// An object containing MessageWithContent keyed by id
export interface MessagesListObject {
  [key: string]: MessageWithContent;
}

// An object containing ServicePublic keyed by id
export interface ServicesListObject {
  [key: string]: ServicePublic;
}

// An array of messages id
export type MessagesIdsArray = ReadonlyArray<string>;

// An array of services id
export type ServicesIdsArray = ReadonlyArray<string>;

/**
 * A generator to load the message detail from the Backend
 *
 * @param {function} getMessage - The function that makes the Backend request
 * @param {string} id - The id of the message to load
 * @returns {(Error|MessageWithContent)}
 */
function* loadMessage(
  getMessage: (
    params: { id: string }
  ) => Promise<BasicResponseType<MessageWithContent> | undefined>,
  id: string
): Iterator<Effect> {
  const response:
    | BasicResponseType<MessageWithContent>
    | undefined = yield call(getMessage, { id });

  if (!response || response.status !== 200) {
    return response ? response.value : Error();
  } else {
    yield put(loadMessageSuccess(response.value));
    return response.value;
  }
}

/**
 * A generator to load the service details from the Backend
 *
 * @param {function} getService - The function that makes the Backend request
 * @param {string} id - The id of the service to load
 * @returns {(Error|ServicePublic)}
 */
function* loadService(
  getService: (
    params: { id: string }
  ) => Promise<BasicResponseType<ServicePublic> | undefined>,
  id: string
): Iterator<Effect> {
  const response: BasicResponseType<ServicePublic> | undefined = yield call(
    getService,
    { id }
  );

  if (!response || response.status !== 200) {
    return response ? response.value : Error();
  } else {
    yield put(loadServiceSuccess(response.value));
    return response.value;
  }
}

/**
 * A generator to load messages from the Backend.
 * The messages returned by the Backend are filtered so the application downloads
 * only the details of the messages and services not already in the redux store.
 */
function* loadMessages(): Iterator<Effect> {
  // Get the token from the state
  const sessionToken: string | undefined = yield select(sessionTokenSelector);

  if (sessionToken) {
    // Create the backendClient to make fetch requests
    const backendClient = BackendClient(apiUrlPrefix, sessionToken);

    // Load already cached messages from the store
    const cachedMessagesById: MessagesListObject = yield select(
      messagesByIdSelectors
    );

    // Load already cached services from the store
    const cachedServicesById: ServicesListObject = yield select(
      servicesByIdSelector
    );

    // Request the list of messages from the Backend
    const response: BasicResponseType<Messages> | undefined = yield call(
      backendClient.getMessages,
      {}
    );

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
      // We fetch services first because to show messages you need the related service info
      yield all(
        newServicesIds.map(id =>
          call(loadService, backendClient.getService, id)
        )
      );

      // Fetch the messages detail in parallel
      yield all(
        newMessagesIds.map(id =>
          call(loadMessage, backendClient.getMessage, id)
        )
      );

      yield put(loadMessagesSuccess());
    }
  }
}

export default function* root(): Iterator<Effect> {
  yield takeLatest(MESSAGES_LOAD_REQUEST, loadMessages);
}
