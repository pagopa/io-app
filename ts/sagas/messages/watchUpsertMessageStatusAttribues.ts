import { call, put, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";

import { BackendClient } from "../../api/backend";
import {
  upsertMessageStatusAttributes,
  UpsertMessageStatusAttributesPayload
} from "../../store/actions/messages";
import { ReduxSagaEffect, SagaCallReturnType } from "../../types/utils";
import { getError } from "../../utils/errors";
import { MessageStatusChange } from "../../../definitions/backend/MessageStatusChange";
import { MessageStatusBulkChange } from "../../../definitions/backend/MessageStatusBulkChange";
import { MessageStatusReadingChange } from "../../../definitions/backend/MessageStatusReadingChange";
import { MessageStatusArchivingChange } from "../../../definitions/backend/MessageStatusArchivingChange";
import { isTestEnv } from "../../utils/environment";
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
  yield* takeLatest(
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

function tryUpsertMessageStatusAttributes(putMessage: LocalBeClient) {
  return function* gen(
    action: LocalActionType
  ): Generator<ReduxSagaEffect, void, SagaCallReturnType<typeof putMessage>> {
    try {
      const messageStatusChange = validatePayload(action.payload);
      const response: SagaCallReturnType<typeof putMessage> = yield* call(
        putMessage,
        { id: action.payload.id, messageStatusChange }
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

export const testTryUpsertMessageStatusAttributes = isTestEnv
  ? tryUpsertMessageStatusAttributes
  : undefined;
