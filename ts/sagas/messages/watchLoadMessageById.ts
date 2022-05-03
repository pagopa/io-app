import { call, takeEvery, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaIterator } from "redux-saga";
import { BackendClient } from "../../api/backend";
import { loadMessageById } from "../../store/actions/messages";
import { toUIMessage } from "../../store/reducers/entities/messages/transformers";
import { PaginatedPublicMessagesCollection } from "../../../definitions/backend/PaginatedPublicMessagesCollection";
import { handleResponse } from "./utils";

type LocalActionType = ActionType<typeof loadMessageById["request"]>;
type LocalBeClient = ReturnType<typeof BackendClient>["getMessages"];

export function* watchLoadMessageById(
  getMessages: LocalBeClient
): SagaIterator {
  yield* takeEvery(loadMessageById.request, handleLoadMessageById, getMessages);
}

function* handleLoadMessageById(
  getMessages: LocalBeClient,
  action: LocalActionType
): SagaIterator {
  const id = action.payload.id;

  try {
    const response = yield* call(getMessages, {
      enrich_result_data: true,
      page_size: 1,
      maximum_id: id,
      minimum_id: id
    });
    const nextAction = handleResponse(
      response,
      ({ items }: PaginatedPublicMessagesCollection) => {
        if (items.length > 0) {
          return loadMessageById.success(toUIMessage(items[0]));
        }
        return loadMessageById.failure({
          id,
          error: new Error("No message with the provided id")
        });
      },
      error => loadMessageById.failure({ id, error })
    );
    yield* put(nextAction);
  } catch (error) {
    yield* put(loadMessageById.failure({ id, error }));
  }
}
