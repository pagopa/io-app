import * as E from "fp-ts/lib/Either";
import * as pot from "@pagopa/ts-commons/lib/pot";
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
  E.Either<Error, CreatedMessageWithContentAndAttachments>,
  any
> {
  // Load the messages already in the redux store
  const cachedMessage: ReturnType<ReturnType<typeof messageStateByIdSelector>> =
    yield* select(messageStateByIdSelector(meta.id));

  // If we already have the message in the store just return it
  if (cachedMessage !== undefined && pot.isSome(cachedMessage.message)) {
    return E.right<Error, CreatedMessageWithContentAndAttachments>(
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

    if (E.isLeft(maybeMessage)) {
      throw maybeMessage.left;
    } else {
      yield* put(loadMessageAction.success(maybeMessage.right));
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
    return E.left<Error, CreatedMessageWithContentAndAttachments>(error);
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
  E.Either<Error, CreatedMessageWithContentAndAttachments>,
  any
> {
  try {
    const response: SagaCallReturnType<typeof getMessage> = yield* call(
      getMessage,
      { id: meta.id }
    );
    if (E.isLeft(response)) {
      throw Error(readablePrivacyReport(response.left));
    }
    if (response.right.status !== 200) {
      const error =
        response.right.status === 500
          ? response.right.value.title
          : `response status ${response.right.status}`;
      // Return the error
      return E.left<Error, CreatedMessageWithContentAndAttachments>(
        Error(error)
      );
    }

    return E.right<Error, CreatedMessageWithContentAndAttachments>(
      response.right.value
    );
  } catch (e) {
    // Return the error
    return E.left<Error, CreatedMessageWithContentAndAttachments>(convertUnknownToError(error));
  }
}

export const testFetchMessage = isTestEnv ? fetchMessage : undefined;
