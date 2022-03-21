import { call, put, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";

import { BackendClient } from "../../api/backend";
import { loadPreviousPageMessages as loadPreviousPageMessagesAction } from "../../store/actions/messages";
import { ReduxSagaEffect, SagaCallReturnType } from "../../types/utils";
import { toUIMessage } from "../../store/reducers/entities/messages/transformers";
import { PaginatedPublicMessagesCollection } from "../../../definitions/backend/PaginatedPublicMessagesCollection";
import { isTestEnv } from "../../utils/environment";
import { getError } from "../../utils/errors";

import { handleResponse } from "./utils";

type LocalActionType = ActionType<
  typeof loadPreviousPageMessagesAction["request"]
>;
type LocalBeClient = ReturnType<typeof BackendClient>["getMessages"];

export default function* watcher(
  getMessages: LocalBeClient
): Generator<ReduxSagaEffect, void, SagaCallReturnType<typeof getMessages>> {
  yield* takeLatest(
    getType(loadPreviousPageMessagesAction.request),
    tryLoadPreviousPageMessages(getMessages)
  );
}

function tryLoadPreviousPageMessages(getMessages: LocalBeClient) {
  return function* gen(
    action: LocalActionType
  ): Generator<ReduxSagaEffect, void, SagaCallReturnType<typeof getMessages>> {
    const { filter, cursor, pageSize } = action.payload;
    try {
      const response: SagaCallReturnType<typeof getMessages> = yield* call(
        getMessages,
        {
          enrich_result_data: true,
          page_size: pageSize,
          minimum_id: cursor,
          get_archived: filter.getArchived
        }
      );

      const nextAction = handleResponse<PaginatedPublicMessagesCollection>(
        response,
        ({ items, prev }: PaginatedPublicMessagesCollection) =>
          loadPreviousPageMessagesAction.success({
            messages: items.map(toUIMessage),
            pagination: { previous: prev },
            filter
          }),
        error =>
          loadPreviousPageMessagesAction.failure({
            error: getError(error),
            filter
          })
      );

      yield* put(nextAction);
    } catch (error) {
      yield* put(loadPreviousPageMessagesAction.failure({ error, filter }));
    }
  };
}

export const testTryLoadPreviousPageMessages = isTestEnv
  ? tryLoadPreviousPageMessages
  : undefined;
