import { Either, left, right } from "fp-ts/lib/Either";
import * as pot from "italia-ts-commons/lib/pot";
import { TypeofApiCall } from "italia-ts-commons/lib/requests";
import { buffers, Channel, channel } from "redux-saga";
import { call, Effect, fork, put, select, take } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";

import { CreatedMessageWithoutContent } from "../../../definitions/backend/CreatedMessageWithoutContent";
import { GetUserMessageT } from "../../../definitions/backend/requestTypes";
import { loadMessage as loadMessageAction } from "../../store/actions/messages";
import { messageStateByIdSelector } from "../../store/reducers/entities/messages/messagesById";
import { GlobalState } from "../../store/reducers/types";
import {
  MessageWithContentPO,
  toMessageWithContentPO
} from "../../types/MessageWithContentPO";
import { SagaCallReturnType } from "../../types/utils";

const HANDLERS_NUMBER = 5;

export function* watchMessageLoadRequest(
  getMessage: TypeofApiCall<GetUserMessageT>
) {
  const requestsChannel: Channel<
    ActionType<typeof loadMessageAction.request>
  > = yield call(channel, buffers.expanding());

  // Start handlers
  // tslint:disable-next-line:no-let
  for (let i = 0; i < HANDLERS_NUMBER; i++) {
    yield fork(handleMessageLoadRequest, requestsChannel, getMessage);
  }

  while (true) {
    // Take the loadMessage request action and put back in the channel
    // to be processed by the handlers.
    const action = yield take(getType(loadMessageAction.request));

    //console.log("Dispatching loadMessage request to handlers");
    requestsChannel.put(action);
    //console.log("Dispatched loadMessage request to handlers");
  }
}

function* handleMessageLoadRequest(
  requestsChannel: Channel<ActionType<typeof loadMessageAction.request>>,
  getMessage: TypeofApiCall<GetUserMessageT>
) {
  console.log("Handler for loadMessage request started");

  // Infinite loog that wait and process loadMessage request from the channel
  while (true) {
    console.log("Waiting for loadMessage request");
    const action: ActionType<typeof loadMessageAction.request> = yield take(
      requestsChannel
    );
    console.log("Just arrived a loadMessage request");

    const meta = action.payload;

    yield call(loadMessage, getMessage, meta);
  }
}

export function* loadMessage(
  getMessage: TypeofApiCall<GetUserMessageT>,
  meta: CreatedMessageWithoutContent
): IterableIterator<Effect | Either<Error, MessageWithContentPO>> {
  console.log("Loading message");

  // If we already have the message in the store just return it
  const cachedMessage: ReturnType<
    ReturnType<typeof messageStateByIdSelector>
  > = yield select<GlobalState>(messageStateByIdSelector(meta.id));

  if (cachedMessage && pot.isSome(cachedMessage.message)) {
    return right(cachedMessage);
  }

  const maybeMessage: SagaCallReturnType<typeof fetchMessage> = yield call(
    fetchMessage,
    getMessage,
    meta
  );

  if (maybeMessage.isLeft()) {
    yield put(
      loadMessageAction.failure({
        id: meta.id,
        error: maybeMessage.value.message
      })
    );
  } else {
    yield put(loadMessageAction.success(maybeMessage.value));
  }
}

export function* fetchMessage(
  getMessage: TypeofApiCall<GetUserMessageT>,
  meta: CreatedMessageWithoutContent
): IterableIterator<Effect | Either<Error, MessageWithContentPO>> {
  try {
    const response: SagaCallReturnType<typeof getMessage> = yield call(
      getMessage,
      { id: meta.id }
    );

    if (!response || response.status !== 200) {
      const error =
        response && response.status === 500 ? response.value.title : undefined;
      return left(Error(error));
    }

    // Trigger an action to store the new message (converted to plain object) and return it
    const messageWithContentPO = toMessageWithContentPO(response.value);
    return right(messageWithContentPO);
  } catch (error) {
    return left(error);
  }
}
