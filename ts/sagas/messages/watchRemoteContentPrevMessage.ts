import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { SagaIterator } from "redux-saga";
import { call, put, race, take, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import { convertUnknownToError } from "../../utils/errors";
import {
  remoteContentPrevMessage,
  clearRemoteContentPrevMessage
} from "../../store/actions/messages";

function* workerRemoteContentPrevMessage(
  getRemoteContentPrevMessage: ReturnType<
    typeof BackendClient
  >["getRemoteContentPrevMessage"],
  action: ActionType<typeof remoteContentPrevMessage.request>
) {
  const message = action.payload;

  try {
    const result = yield* call(getRemoteContentPrevMessage, {
      id: message.id
    });

    if (E.isRight(result)) {
      if (result.right.status === 200) {
        yield* put(remoteContentPrevMessage.success(result.right.value));
        return;
      }
      throw Error(`response status ${result.right.status}`);
    } else {
      throw Error(readableReport(result.left));
    }
  } catch (e) {
    yield* put(remoteContentPrevMessage.failure(convertUnknownToError(e)));
  }
}

export function* watchRemoteContentPrevMessage(
  getRemoteContentPrevMessage: ReturnType<
    typeof BackendClient
  >["getRemoteContentPrevMessage"]
): SagaIterator {
  yield* takeLatest(
    getType(remoteContentPrevMessage.request),
    function* (action: ActionType<typeof remoteContentPrevMessage.request>) {
      yield* race({
        response: call(
          workerRemoteContentPrevMessage,
          getRemoteContentPrevMessage,
          action
        ),
        cancel: take(clearRemoteContentPrevMessage)
      });
    }
  );
}
