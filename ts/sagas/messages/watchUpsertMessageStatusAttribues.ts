import { call, put, select, take, takeEvery } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { MessageStatusArchivingChange } from "../../../definitions/backend/MessageStatusArchivingChange";
import { MessageStatusBulkChange } from "../../../definitions/backend/MessageStatusBulkChange";
import { MessageStatusChange } from "../../../definitions/backend/MessageStatusChange";
import { MessageStatusReadingChange } from "../../../definitions/backend/MessageStatusReadingChange";
import { BackendClient } from "../../api/backend";
import {
  loadNextPageMessages,
  loadPreviousPageMessages,
  reloadAllMessages,
  upsertMessageStatusAttributes,
  UpsertMessageStatusAttributesPayload
} from "../../store/actions/messages";
import { isLoadingOrUpdatingInbox } from "../../store/reducers/entities/messages/allPaginated";
import { ReduxSagaEffect, SagaCallReturnType } from "../../types/utils";
import { isTestEnv } from "../../utils/environment";
import { getError } from "../../utils/errors";
import { handleResponse } from "./utils";

type LocalActionType = ActionType<
  typeof upsertMessageStatusAttributes["request"]
>;
type LocalBeClient = ReturnType<
  typeof BackendClient
>["upsertMessageStatusAttributes"];

export default function* watcher(
  putMessage: LocalBeClient
): Generator<ReduxSagaEffect, void, SagaCallReturnType<typeof putMessage>> {
  yield* takeEvery(
    getType(upsertMessageStatusAttributes.request),
    tryUpsertMessageStatusAttributes(putMessage)
  );
}

/**
 * @throws invalid payload
 * @param payload
 */
function validatePayload(
  payload: UpsertMessageStatusAttributesPayload
): MessageStatusChange {
  switch (payload.update.tag) {
    case "archiving":
      return {
        change_type: "archiving",
        is_archived: payload.update.isArchived
      } as MessageStatusArchivingChange;
    case "reading":
      return {
        change_type: "reading",
        is_read: true
      } as MessageStatusReadingChange;
    case "bulk":
      return {
        change_type: "bulk",
        is_read: true,
        is_archived: payload.update.isArchived
      } as MessageStatusBulkChange;
    default:
      throw new TypeError("invalid payload");
  }
}

function* waitForInboxLoadingOrUpdating(): Generator<
  ReduxSagaEffect,
  void,
  void
> {
  if (!(yield* select(isLoadingOrUpdatingInbox))) {
    return;
  }

  while (true) {
    yield* take<
      ActionType<
        | typeof loadPreviousPageMessages.failure
        | typeof loadPreviousPageMessages.success
        | typeof loadNextPageMessages.failure
        | typeof loadNextPageMessages.success
        | typeof reloadAllMessages.failure
        | typeof reloadAllMessages.success
      >
    >([
      loadPreviousPageMessages.failure,
      loadPreviousPageMessages.success,
      loadNextPageMessages.failure,
      loadNextPageMessages.success,
      reloadAllMessages.failure,
      reloadAllMessages.success
    ]);

    if (!(yield* select(isLoadingOrUpdatingInbox))) {
      return;
    }
  }
}

function tryUpsertMessageStatusAttributes(putMessage: LocalBeClient) {
  return function* gen(
    action: LocalActionType
  ): Generator<ReduxSagaEffect, void, SagaCallReturnType<typeof putMessage>> {
    try {
      yield* call(waitForInboxLoadingOrUpdating);

      const body = validatePayload(action.payload);
      const response: SagaCallReturnType<typeof putMessage> = yield* call(
        putMessage,
        { id: action.payload.message.id, body }
      );

      const nextAction = handleResponse<unknown>(
        response,
        _ => upsertMessageStatusAttributes.success(action.payload),
        error =>
          upsertMessageStatusAttributes.failure({
            error: getError(error),
            payload: action.payload
          })
      );

      yield* put(nextAction);
    } catch (error) {
      yield* put(
        upsertMessageStatusAttributes.failure({
          error: getError(error),
          payload: action.payload
        })
      );
    }
  };
}

export const testWaitForInboxLoadingOrUpdating = isTestEnv
  ? waitForInboxLoadingOrUpdating
  : undefined;

export const testTryUpsertMessageStatusAttributes = isTestEnv
  ? tryUpsertMessageStatusAttributes
  : undefined;
