import { call, Effect, put, takeLatest } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";

import { BackendClient } from "../../api/backend";
import { loadPreviousPageMessages as loadPreviousPageMessagesAction } from "../../store/actions/messages";
import { SagaCallReturnType } from "../../types/utils";
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
): Generator<Effect, void, SagaCallReturnType<typeof getMessages>> {
  yield takeLatest(
    getType(loadPreviousPageMessagesAction.request),
    tryLoadPreviousPageMessages(getMessages)
  );
}

function tryLoadPreviousPageMessages(getMessages: LocalBeClient) {
  return function* gen(
    action: LocalActionType
  ): Generator<Effect, void, SagaCallReturnType<typeof getMessages>> {
    try {
      const response: SagaCallReturnType<typeof getMessages> = yield call(
        getMessages,
        {
          enrich_result_data: true,
          page_size: action.payload.pageSize,
          maximum_id: action.payload.cursor
        }
      );

      const nextAction = handleResponse<PaginatedPublicMessagesCollection>(
        response,
        ({ items, prev }: PaginatedPublicMessagesCollection) =>
          loadPreviousPageMessagesAction.success({
            messages: items.map(toUIMessage),
            pagination: { previous: prev }
          }),
        error => loadPreviousPageMessagesAction.failure(getError(error))
      );

      yield put(nextAction);
    } catch (error) {
      yield put(loadPreviousPageMessagesAction.failure(error));
    }
  };
}

export const testTryLoadPreviousPageMessages = isTestEnv
  ? tryLoadPreviousPageMessages
  : undefined;
