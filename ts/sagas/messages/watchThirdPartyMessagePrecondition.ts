import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { SagaIterator } from "redux-saga";
import { call, put, race, take, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import { convertUnknownToError } from "../../utils/errors";
import {
  loadThirdPartyMessagePrecondition,
  clearThirdPartyMessagePrecondition
} from "../../store/actions/messages";

function* workerThirdPartyMessagePrecondition(
  getThirdPartyMessagePrecondition: ReturnType<
    typeof BackendClient
  >["getThirdPartyMessagePrecondition"],
  action: ActionType<typeof loadThirdPartyMessagePrecondition.request>
) {
  const messageId = action.payload;

  try {
    const result = yield* call(getThirdPartyMessagePrecondition, {
      id: messageId
    });

    if (E.isRight(result)) {
      if (result.right.status === 200) {
        yield* put(
          loadThirdPartyMessagePrecondition.success(result.right.value)
        );
        return;
      }
      throw Error(`response status ${result.right.status}`);
    } else {
      throw Error(readableReport(result.left));
    }
  } catch (e) {
    yield* put(
      loadThirdPartyMessagePrecondition.failure(convertUnknownToError(e))
    );
  }
}

export function* watchThirdPartyMessagePrecondition(
  getThirdPartyMessagePrecondition: ReturnType<
    typeof BackendClient
  >["getThirdPartyMessagePrecondition"]
): SagaIterator {
  yield* takeLatest(
    getType(loadThirdPartyMessagePrecondition.request),
    function* (
      action: ActionType<typeof loadThirdPartyMessagePrecondition.request>
    ) {
      yield* race({
        response: call(
          workerThirdPartyMessagePrecondition,
          getThirdPartyMessagePrecondition,
          action
        ),
        cancel: take(clearThirdPartyMessagePrecondition)
      });
    }
  );
}
