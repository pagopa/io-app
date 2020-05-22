/**
 * Generators for the message entity that can be called directly
 * without dispatching a redux action.
 */
import { Either, left, right } from "fp-ts/lib/Either";
import * as pot from "italia-ts-commons/lib/pot";
import { call, Effect, put, select } from "redux-saga/effects";

import { CreatedMessageWithContentAndAttachments } from "../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { CreatedMessageWithoutContent } from "../../../definitions/backend/CreatedMessageWithoutContent";
import { BackendClient } from "../../api/backend";
import { loadMessage as loadMessageAction } from "../../store/actions/messages";
import { messageStateByIdSelector } from "../../store/reducers/entities/messages/messagesById";
import { GlobalState } from "../../store/reducers/types";
import { SagaCallReturnType } from "../../types/utils";
import { readablePrivacyReport } from "../../utils/reporters";

/**
 * A saga to fetch a message from the Backend and save it in the redux store.
 */
export function* loadMessage(
  getMessage: ReturnType<typeof BackendClient>["getMessage"],
  meta: CreatedMessageWithoutContent
): IterableIterator<
  Effect | Either<Error, CreatedMessageWithContentAndAttachments>
> {
  // Load the messages already in the redux store
  const cachedMessage: ReturnType<
    ReturnType<typeof messageStateByIdSelector>
  > = yield select<GlobalState>(messageStateByIdSelector(meta.id));

  // If we already have the message in the store just return it
  if (cachedMessage !== undefined && pot.isSome(cachedMessage.message)) {
    return right(cachedMessage);
  }
  try {
    // Fetch the message from the Backend
    const maybeMessage: SagaCallReturnType<typeof fetchMessage> = yield call(
      fetchMessage,
      getMessage,
      meta
    );

    if (maybeMessage.isLeft()) {
      throw maybeMessage.value;
    } else {
      yield put(loadMessageAction.success(maybeMessage.value));
    }
    return maybeMessage;
  } catch (error) {
    yield put(
      loadMessageAction.failure({
        id: meta.id,
        error
      })
    );
    return left(error);
  }
}

/**
 * A saga to fetch a message from the Backend
 */
export function* fetchMessage(
  getMessage: ReturnType<typeof BackendClient>["getMessage"],
  meta: CreatedMessageWithoutContent
): IterableIterator<
  Effect | Either<Error, CreatedMessageWithContentAndAttachments>
> {
  try {
    const response: SagaCallReturnType<typeof getMessage> = yield call(
      getMessage,
      { id: meta.id }
    );
    if (response.isLeft()) {
      throw Error(readablePrivacyReport(response.value));
    }
    if (response.value.status !== 200) {
      const error =
        response.value.status === 500
          ? response.value.value.title
          : `response status ${response.value.status}`;
      // Return the error
      return left(Error(error));
    }

    return right(response.value.value);
  } catch (error) {
    // Return the error
    return left(error);
  }
}
