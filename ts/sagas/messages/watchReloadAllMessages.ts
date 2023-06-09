import { call, put, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import { reloadAllMessages as reloadAllMessagesAction } from "../../store/actions/messages";
import { ReduxSagaEffect, SagaCallReturnType } from "../../types/utils";
import { toUIMessage } from "../../store/reducers/entities/messages/transformers";
import { PaginatedPublicMessagesCollection } from "../../../definitions/backend/PaginatedPublicMessagesCollection";
import { isTestEnv } from "../../utils/environment";
import { getError } from "../../utils/errors";
import { handleResponse } from "./utils";

type LocalActionType = ActionType<typeof reloadAllMessagesAction["request"]>;
type LocalBeClient = ReturnType<typeof BackendClient>["getMessages"];

export default function* watcher(
  getMessages: LocalBeClient
): Generator<ReduxSagaEffect, void, SagaCallReturnType<typeof getMessages>> {
  yield* takeLatest(
    getType(reloadAllMessagesAction.request),
    tryReloadAllMessages(getMessages)
  );
}

function tryReloadAllMessages(getMessages: LocalBeClient) {
  return function* gen(
    action: LocalActionType
  ): Generator<ReduxSagaEffect, void, SagaCallReturnType<typeof getMessages>> {
    const { filter, pageSize } = action.payload;
    try {
      const response: SagaCallReturnType<typeof getMessages> = yield* call(
        getMessages,
        {
          enrich_result_data: true,
          page_size: pageSize,
          archived: filter.getArchived
        }
      );
      const nextAction = handleResponse<PaginatedPublicMessagesCollection>(
        response,
        ({ items, next, prev }: PaginatedPublicMessagesCollection) =>
          reloadAllMessagesAction.success({
            messages: items.map(toUIMessage),
            pagination: { previous: prev, next },
            filter
          }),
        error =>
          reloadAllMessagesAction.failure({
            error: getError(error),
            filter
          })
      );

      if (nextAction) {
        yield* put(nextAction);
      }
    } catch (error) {
      yield* put(
        reloadAllMessagesAction.failure({
          error: getError(error),
          filter
        })
      );
    }
  };
}

export const testTryLoadPreviousPageMessages = isTestEnv
  ? tryReloadAllMessages
  : undefined;
