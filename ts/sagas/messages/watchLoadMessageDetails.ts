import { call, Effect, put, takeLatest } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";

import { CreatedMessageWithContentAndAttachments } from "../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { BackendClient } from "../../api/backend";
import { loadMessageDetails as loadMessageDetailsAction } from "../../store/actions/messages";
import { SagaCallReturnType } from "../../types/utils";
import { getError } from "../../utils/errors";
import { toUIMessageDetails } from "../../store/reducers/entities/messages/transformers";

import { handleResponse } from "./utils";

type LocalActionType = ActionType<typeof loadMessageDetailsAction["request"]>;
type LocalBeClient = ReturnType<typeof BackendClient>["getMessage"];

export default function* watcher(
  getMessage: LocalBeClient
): Generator<Effect, void, SagaCallReturnType<typeof getMessage>> {
  yield takeLatest(
    getType(loadMessageDetailsAction.request),
    tryLoadMessageDetails(getMessage)
  );
}

/**
 * A saga to fetch a message from the Backend and save it in the redux store.
 *
 * @param getMessage
 * @param id
 */
export function tryLoadMessageDetails(getMessage: LocalBeClient) {
  return function* gen(
    action: LocalActionType
  ): Generator<Effect, void, SagaCallReturnType<typeof getMessage>> {
    const id = action.payload.id;
    try {
      const response: SagaCallReturnType<typeof getMessage> = yield call(
        getMessage,
        { id }
      );
      const nextAction =
        handleResponse<CreatedMessageWithContentAndAttachments>(
          response,
          (message: CreatedMessageWithContentAndAttachments) =>
            loadMessageDetailsAction.success(toUIMessageDetails(message)),
          error =>
            loadMessageDetailsAction.failure({
              id,
              error: getError(error)
            })
        );

      yield put(nextAction);
    } catch (error) {
      yield put(
        loadMessageDetailsAction.failure({
          id,
          error: getError(error)
        })
      );
    }
  };
}
