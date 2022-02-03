import { call, put, takeLatest } from "typed-redux-saga/macro";
import { Effect } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";

import { BackendClient } from "../../api/backend";
import { reloadAllMessages as reloadAllMessagesAction } from "../../store/actions/messages";
import { SagaCallReturnType } from "../../types/utils";
import { toUIMessage } from "../../store/reducers/entities/messages/transformers";
import { PaginatedPublicMessagesCollection } from "../../../definitions/backend/PaginatedPublicMessagesCollection";
import { isTestEnv } from "../../utils/environment";
import { getError } from "../../utils/errors";

import { handleResponse } from "./utils";

type LocalActionType = ActionType<typeof reloadAllMessagesAction["request"]>;
type LocalBeClient = ReturnType<typeof BackendClient>["getMessages"];

export default function* watcher(
  getMessages: LocalBeClient
): Generator<Effect, void, SagaCallReturnType<typeof getMessages>> {
  yield* takeLatest(
    getType(reloadAllMessagesAction.request),
    tryReloadAllMessages(getMessages)
  );
}

function tryReloadAllMessages(getMessages: LocalBeClient) {
  return function* gen(
    action: LocalActionType
  ): Generator<Effect, void, SagaCallReturnType<typeof getMessages>> {
    try {
      const response: SagaCallReturnType<typeof getMessages> = yield* call(
        getMessages,
        {
          enrich_result_data: true,
          page_size: action.payload.pageSize
        }
      );

      const nextAction = handleResponse<PaginatedPublicMessagesCollection>(
        response,
        ({ items, next, prev }: PaginatedPublicMessagesCollection) =>
          reloadAllMessagesAction.success({
            messages: items.map(toUIMessage),
            pagination: { previous: prev, next }
          }),
        error => reloadAllMessagesAction.failure(getError(error))
      );

      yield* put(nextAction);
    } catch (error) {
      yield* put(reloadAllMessagesAction.failure(getError(error)));
    }
  };
}

export const testTryLoadPreviousPageMessages = isTestEnv
  ? tryReloadAllMessages
  : undefined;
