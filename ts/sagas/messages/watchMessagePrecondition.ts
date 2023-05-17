import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { SagaIterator } from "redux-saga";
import { call, put, race, take, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import { convertUnknownToError } from "../../utils/errors";
import {
  getMessagePrecondition,
  clearMessagePrecondition
} from "../../store/actions/messages";
import { isTestEnv } from "../../utils/environment";

export const testWorkerMessagePrecondition = isTestEnv
  ? workerMessagePrecondition
  : undefined;

function* workerMessagePrecondition(
  getThirdPartyMessagePrecondition: ReturnType<
    typeof BackendClient
  >["getThirdPartyMessagePrecondition"],
  action: ActionType<typeof getMessagePrecondition.request>
) {
  const messageId = action.payload;

  try {
    const result = yield* call(getThirdPartyMessagePrecondition, {
      id: messageId
    });

    if (E.isRight(result)) {
      if (result.right.status === 200) {
        yield* put(getMessagePrecondition.success(result.right.value));
        return;
      }
      throw Error(`response status ${result.right.status}`);
    } else {
      throw Error(readableReport(result.left));
    }
  } catch (e) {
    yield* put(getMessagePrecondition.failure(convertUnknownToError(e)));
  }
}

export function* watchMessagePrecondition(
  getThirdPartyMessagePrecondition: ReturnType<
    typeof BackendClient
  >["getThirdPartyMessagePrecondition"]
): SagaIterator {
  yield* takeLatest(
    getType(getMessagePrecondition.request),
    function* (action: ActionType<typeof getMessagePrecondition.request>) {
      yield* race({
        response: call(
          workerMessagePrecondition,
          getThirdPartyMessagePrecondition,
          action
        ),
        cancel: take(clearMessagePrecondition)
      });
    }
  );
}
