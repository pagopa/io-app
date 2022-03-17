import { call, put, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";

import { BackendClient } from "../../api/backend";
import { loadNextPageMessages as loadNextPageMessagesAction } from "../../store/actions/messages";
import { ReduxSagaEffect, SagaCallReturnType } from "../../types/utils";
import { toUIMessage } from "../../store/reducers/entities/messages/transformers";
import { PaginatedPublicMessagesCollection } from "../../../definitions/backend/PaginatedPublicMessagesCollection";
import { isTestEnv } from "../../utils/environment";
import { getError } from "../../utils/errors";

import { handleResponse } from "./utils";

type LocalActionType = ActionType<typeof loadNextPageMessagesAction["request"]>;
type LocalBeClient = ReturnType<typeof BackendClient>["getMessages"];

export default function* watcher(
  getMessages: LocalBeClient
): Generator<ReduxSagaEffect, void, SagaCallReturnType<typeof getMessages>> {
  yield* takeLatest(
    getType(loadNextPageMessagesAction.request),
    tryLoadNextPageMessages(getMessages)
  );
}

function tryLoadNextPageMessages(getMessages: LocalBeClient) {
  return function* gen(
    action: LocalActionType
  ): Generator<ReduxSagaEffect, void, SagaCallReturnType<typeof getMessages>> {
    const { filter, pageSize, cursor } = action.payload;
    try {
      const response: SagaCallReturnType<typeof getMessages> = yield* call(
        getMessages,
        {
          enrich_result_data: true,
          page_size: pageSize,
          maximum_id: cursor,
          get_archived: filter.getArchived
        }
      );

      const nextAction = handleResponse<PaginatedPublicMessagesCollection>(
        response,
        ({ items, next }: PaginatedPublicMessagesCollection) =>
          loadNextPageMessagesAction.success({
            messages: items.map(toUIMessage),
            pagination: { next },
            filter
          }),
        error =>
          loadNextPageMessagesAction.failure({ error: getError(error), filter })
      );

      yield* put(nextAction);
    } catch (error) {
      yield* put(loadNextPageMessagesAction.failure({ error, filter }));
    }
  };
}

export const testTryLoadNextPageMessages = isTestEnv
  ? tryLoadNextPageMessages
  : undefined;
