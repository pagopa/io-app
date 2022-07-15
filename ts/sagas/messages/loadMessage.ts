import { Either, left, right } from "fp-ts/lib/Either";
import * as pot from "italia-ts-commons/lib/pot";
import { call, put, select } from "typed-redux-saga/macro";
import { CreatedMessageWithContentAndAttachments } from "../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { CreatedMessageWithoutContent } from "../../../definitions/backend/CreatedMessageWithoutContent";
import { BackendClient } from "../../api/backend";
import { DEPRECATED_loadMessage as loadMessageAction } from "../../store/actions/messages";
import { messageStateByIdSelector } from "../../store/reducers/entities/messages/messagesById";
import { ReduxSagaEffect, SagaCallReturnType } from "../../types/utils";
import { readablePrivacyReport } from "../../utils/reporters";
import { isTestEnv } from "../../utils/environment";
import { convertUnknownToError } from "../../utils/errors";

/**
 * A saga to fetch a message from the Backend and save it in the redux store.
 * Can be called directly without dispatching a redux action.
 */
export function* loadMessage(
  getMessage: ReturnType<typeof BackendClient>["getMessage"],
  meta: CreatedMessageWithoutContent
): Generator<
  ReduxSagaEffect,
  Either<Error, CreatedMessageWithContentAndAttachments>,
  any
> {
  // Load the messages already in the redux store
  const cachedMessage: ReturnType<ReturnType<typeof messageStateByIdSelector>> =
    yield* select(messageStateByIdSelector(meta.id));

  // If we already have the message in the store just return it
  if (cachedMessage !== undefined && pot.isSome(cachedMessage.message)) {
    return right<Error, CreatedMessageWithContentAndAttachments>(
      cachedMessage.message.value
    );
  }
  try {
    // Fetch the message from the Backend
    const maybeMessage: SagaCallReturnType<typeof fetchMessage> = yield* call(
      fetchMessage,
      getMessage,
      meta
    );

    if (maybeMessage.isLeft()) {
      throw maybeMessage.value;
    } else {
      yield* put(loadMessageAction.success(maybeMessage.value));
    }
    return maybeMessage;
  } catch (e) {
    const error = convertUnknownToError(e);

    yield* put(
      loadMessageAction.failure({
        id: meta.id,
        error
      })
    );
    return left<Error, CreatedMessageWithContentAndAttachments>(error);
  }
}

/**
 * A saga to fetch a message from the Backend
 */
function* fetchMessage(
  getMessage: ReturnType<typeof BackendClient>["getMessage"],
  meta: CreatedMessageWithoutContent
): Generator<
  ReduxSagaEffect,
  Either<Error, CreatedMessageWithContentAndAttachments>,
  any
> {
  try {
    const response: SagaCallReturnType<typeof getMessage> = yield* call(
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
      return left<Error, CreatedMessageWithContentAndAttachments>(Error(error));
    }

    return right<Error, CreatedMessageWithContentAndAttachments>(
      response.value.value
    );
  } catch (e) {
    // Return the error
    return left<Error, CreatedMessageWithContentAndAttachments>(
      convertUnknownToError(e)
    );
  }
}

export const testFetchMessage = isTestEnv ? fetchMessage : undefined;
