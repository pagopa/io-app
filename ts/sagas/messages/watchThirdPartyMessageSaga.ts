import { SagaIterator } from "redux-saga";
import { ActionType, getType } from "typesafe-actions";
import { call, put, takeLatest } from "typed-redux-saga/macro";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { BackendClient } from "../../api/backend";
import { loadThirdPartyMessage } from "../../features/messages/store/actions";
import { getError } from "../../utils/errors";

function* getThirdPartyMessage(
  client: ReturnType<typeof BackendClient>,
  action: ActionType<typeof loadThirdPartyMessage.request>
) {
  const id = action.payload;
  try {
    const result = yield* call(client.getThirdPartyMessage, { id });
    if (result.isLeft()) {
      yield* put(
        loadThirdPartyMessage.failure({
          id,
          error: new Error(readableReport(result.value))
        })
      );
    } else if (result.value.status === 200) {
      yield* put(
        loadThirdPartyMessage.success({ id, content: result.value.value })
      );
    } else {
      yield* put(
        loadThirdPartyMessage.failure({
          id,
          error: new Error(`response status ${result.value.status}`)
        })
      );
    }
  } catch (e) {
    yield* put(loadThirdPartyMessage.failure({ id, error: getError(e) }));
  }
}

export function* watchThirdPartyMessageSaga(
  client: ReturnType<typeof BackendClient>
): SagaIterator {
  yield* takeLatest(
    getType(loadThirdPartyMessage.request),
    getThirdPartyMessage,
    client
  );
}
