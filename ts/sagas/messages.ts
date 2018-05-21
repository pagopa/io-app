import { BasicResponseType } from "italia-ts-commons/lib/requests";
import { all, call, Effect, put, select, takeLatest } from "redux-saga/effects";

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
import { sessionTokenSelector } from "../store/reducers/session";

export interface MessagesListObject {
  [key: string]: MessageWithoutContent;
}

export type MessagesIdsArray = ReadonlyArray<string>;

export interface NormalizedMessagesResponse {
  messages: MessagesListObject;
  ids: MessagesIdsArray;
}

export const INITIAL_NORMALIZED_MESSAGES_RESPONSE: NormalizedMessagesResponse = {
  messages: {},
  ids: []
};

function createNormalizedMessagesResponse(
  messages: ReadonlyArray<MessageWithoutContent>
): NormalizedMessagesResponse {
  return messages.reduce((result, value) => {
    return {
      messages: {
        ...result.messages,
        [value.id]: {
          ...value
        }
      },
      ids: [...result.ids, value.id]
    };
  }, INITIAL_NORMALIZED_MESSAGES_RESPONSE);
}

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
      // Get the list of the messages
      const normalizedMessagesResponse = createNormalizedMessagesResponse(
        response.value.items
      );

      for (const id of normalizedMessagesResponse.ids) {
        const [messageWithContent, servicePublic]: [
          MessageWithContent | undefined,
          ServicePublic | undefined
        ] = yield all([
          call(loadMessage, sessionToken, id),
          call(
            loadService,
            sessionToken,
            normalizedMessagesResponse.messages[id].sender_service_id
          )
        ]);
      }

      // Dispatch success action
      yield put(loadMessagesSuccess(normalizedMessagesResponse));
    }
  }
}

export default function* root(): Iterator<Effect> {
  yield takeLatest(MESSAGES_LOAD_REQUEST, loadMessages);
}
