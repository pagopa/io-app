import { call, Effect, put, takeLatest } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import { readableReport } from "italia-ts-commons/lib/reporters";

import { BackendClient } from "../../api/backend";
import { loadNextPageMessages as loadNextPageMessagesAction } from "../../store/actions/messages";
import { SagaCallReturnType } from "../../types/utils";
import { sessionExpired } from "../../store/actions/authentication";
import { toUIMessage } from "../../store/reducers/entities/messages/transformers";

type LocalActionType = ActionType<typeof loadNextPageMessagesAction["request"]>;
type LocalBeClient = ReturnType<typeof BackendClient>["getMessages"];

export function* watchLoadNextPageMessages(
  getMessages: LocalBeClient
): Generator<Effect, void, SagaCallReturnType<typeof getMessages>> {
  yield takeLatest(
    getType(loadNextPageMessagesAction.request),
    (action: LocalActionType) => tryLoadNextPageMessages(getMessages, action)
  );
}

function* tryLoadNextPageMessages(
  getMessages: LocalBeClient,
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

    if (response.isLeft()) {
      yield put(
        loadNextPageMessagesAction.failure(
          new Error(readableReport(response.value))
        )
      );
    }

    if (response.isRight()) {
      if (response.value.status === 401) {
        // on 401, expire the current session and restart the authentication flow
        yield put(sessionExpired());
        return;
      }

      if (response.value.status !== 200) {
        // TODO: provide status code along with message in error https://www.pivotaltracker.com/story/show/170819193
        const error =
          response.value.status === 500 && response.value.value.title
            ? response.value.value.title
            : "UNKNOWN";
        yield put(loadNextPageMessagesAction.failure(Error(error)));
        return;
      }

      // 200 ok
      const { items, next } = response.value.value;
      yield put(
        loadNextPageMessagesAction.success({
          messages: items.map(toUIMessage),
          pagination: { next }
        })
      );
    }
  } catch (error) {
    yield put(loadNextPageMessagesAction.failure(error));
  }
}
