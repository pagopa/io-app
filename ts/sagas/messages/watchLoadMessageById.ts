import { call, takeEvery, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaIterator } from "redux-saga";
import { convertUnknownToError } from "../../utils/errors";
import { BackendClient } from "../../api/backend";
import { loadMessageById } from "../../store/actions/messages";
import { toUIMessage } from "../../store/reducers/entities/messages/transformers";
import { CreatedMessageWithContentAndAttachments } from "../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { handleResponse } from "./utils";

type LocalActionType = ActionType<typeof loadMessageById["request"]>;
type LocalBeClient = ReturnType<typeof BackendClient>["getMessage"];

export function* watchLoadMessageById(getMessage: LocalBeClient): SagaIterator {
  yield* takeEvery(loadMessageById.request, handleLoadMessageById, getMessage);
}

function* handleLoadMessageById(
  getMessage: LocalBeClient,
  action: LocalActionType
): SagaIterator {
  const id = action.payload.id;

  try {
    const response = yield* call(getMessage, {
      id,
      public_message: true
    });
    const nextAction = handleResponse(
      response,
      (message: CreatedMessageWithContentAndAttachments) =>
        loadMessageById.success(toUIMessage(message)),
      error => loadMessageById.failure({ id, error })
    );
    yield* put(nextAction);
  } catch (e) {
    yield* put(
      loadMessageById.failure({ id, error: convertUnknownToError(e) })
    );
  }
}
