import { BasicResponseType } from "italia-ts-commons/lib/requests";
import { call, Effect, put, select, takeLatest } from "redux-saga/effects";

import { Messages } from "../../definitions/backend/Messages";
import { MessageWithContent } from "../../definitions/backend/MessageWithContent";
import { MessageWithoutContent } from "../../definitions/backend/MessageWithoutContent";
import { ServicePublic } from "../../definitions/backend/ServicePublic";
import { BackendClient } from "../api/backend";
import { apiUrlPrefix } from "../config";
import { MESSAGES_LOAD_REQUEST } from "../store/actions/constants";
import {
  loadMessagesFailure,
  loadMessagesSuccess
} from "../store/actions/messages";
import { messagesByIdSelectors } from "../store/reducers/entities/messages/messagesById";
import { servicesByIdSelector } from "../store/reducers/entities/services/servicesById";
import { sessionTokenSelector } from "../store/reducers/session";

export interface MessagesListObject {
  [key: string]: MessageWithoutContent;
}

export interface ServicesListObject {
  [key: string]: ServicePublic;
}

export type MessagesIdsArray = ReadonlyArray<string>;

export type ServicesIdsArray = ReadonlyArray<string>;

export interface NormalizedMessagesResponse {
  messages: {
    byId: MessagesListObject;
    allIds: MessagesIdsArray;
  };
  services: {
    byId: ServicesListObject;
    allIds: ServicesIdsArray;
  };
}

export const INITIAL_NORMALIZED_MESSAGES_RESPONSE: NormalizedMessagesResponse = {
  messages: {
    byId: {},
    allIds: []
  },
  services: {
    byId: {},
    allIds: []
  }
};

function* loadMessage(sessionToken: string, id: string): Iterator<Effect> {
  const backendClient = BackendClient(apiUrlPrefix, sessionToken);

  const response:
    | BasicResponseType<MessageWithContent>
    | undefined = yield call(backendClient.getMessage, { id });

  if (!response || response.status !== 200) {
    return response ? response.value : Error();
  } else {
    return response.value;
  }
}

function* loadService(sessionToken: string, id: string): Iterator<Effect> {
  const backendClient = BackendClient(apiUrlPrefix, sessionToken);

  const response: BasicResponseType<ServicePublic> | undefined = yield call(
    backendClient.getService,
    { id }
  );

  if (!response || response.status !== 200) {
    return response ? response.value : Error();
  } else {
    return response.value;
  }
}

function* loadMessages(): Iterator<Effect> {
  // Get the token from the state
  const sessionToken: string | undefined = yield select(sessionTokenSelector);

  if (sessionToken) {
    const backendClient = BackendClient(apiUrlPrefix, sessionToken);
    const cachedMessagesById: MessagesListObject = yield select(
      messagesByIdSelectors
    );
    const cachedServicesById: ServicesListObject = yield select(
      servicesByIdSelector
    );

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

      const messagesListObject: MessagesListObject = {};
      for (const id of newMessagesIds) {
        const messageWithContent: MessageWithContent = yield call(
          loadMessage,
          sessionToken,
          id
        );

        messagesListObject[id] = messageWithContent;
      }

      const servicesListObject: ServicesListObject = {};
      for (const id of newServicesIds) {
        const servicePublic: ServicePublic = yield call(
          loadService,
          sessionToken,
          id
        );

        servicesListObject[id] = servicePublic;
      }

      // Dispatch success action
      yield put(
        loadMessagesSuccess({
          messages: {
            byId: messagesListObject,
            allIds: newMessagesIds
          },
          services: {
            byId: servicesListObject,
            allIds: newServicesIds
          }
        })
      );
    }
  }
}

export default function* root(): Iterator<Effect> {
  yield takeLatest(MESSAGES_LOAD_REQUEST, loadMessages);
}
