import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
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
    if (E.isLeft(result)) {
      yield* put(
        loadThirdPartyMessage.failure({
          id,
          error: new Error(readableReport(result.left))
        })
      );
    } else if (result.right.status === 200) {
      yield* put(
        loadThirdPartyMessage.success({ id, content: result.right.value })
      );
    } else {
      yield* put(
        loadThirdPartyMessage.failure({
          id,
          error: new Error(`response status ${result.right.status}`)
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
