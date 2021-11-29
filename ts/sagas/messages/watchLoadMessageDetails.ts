import { call, Effect, put, takeLatest } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";

import { CreatedMessageWithContentAndAttachments } from "../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { BackendClient } from "../../api/backend";
import { loadMessageDetails } from "../../store/actions/messages";
import { SagaCallReturnType } from "../../types/utils";
import { getError } from "../../utils/errors";
import { toUIMessageDetails } from "../../store/reducers/entities/messages/transformers";
import { isTestEnv } from "../../utils/environment";

import { handleResponse } from "./utils";

type LocalActionType = ActionType<typeof loadMessageDetails["request"]>;
type LocalBeClient = ReturnType<typeof BackendClient>["getMessage"];

export default function* watcher(
  getMessage: LocalBeClient
): Generator<Effect, void, SagaCallReturnType<typeof getMessage>> {
  yield takeLatest(
    getType(loadMessageDetails.request),
    tryLoadMessageDetails(getMessage)
  );
}

/**
 * A saga to fetch a message from the Backend and save it in the redux store.
 *
 * @param getMessage
 */
function tryLoadMessageDetails(getMessage: LocalBeClient) {
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
            loadMessageDetails.success(toUIMessageDetails(message)),
          error =>
            loadMessageDetails.failure({
              id,
              error: getError(error)
            })
        );

      yield put(nextAction);
    } catch (error) {
      yield put(
        loadMessageDetails.failure({
          id,
          error: getError(error)
        })
      );
    }
  };
}

export const testTryLoadMessageDetails = isTestEnv
  ? tryLoadMessageDetails
  : undefined;
