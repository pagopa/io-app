import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { call, put, race, take } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { BackendClient } from "../../../api/backend";
import { convertUnknownToError } from "../../../utils/errors";
import {
  getMessagePrecondition,
  clearMessagePrecondition
} from "../store/actions";
import { isTestEnv } from "../../../utils/environment";
import { withRefreshApiCall } from "../../fastLogin/saga/utils";
import { SagaCallReturnType } from "../../../types/utils";
import { trackDisclaimerLoadError } from "../analytics";

export const testMessagePreconditionWorker = isTestEnv
  ? messagePreconditionWorker
  : undefined;

function* messagePreconditionWorker(
  getThirdPartyMessagePrecondition: ReturnType<
    BackendClient["getThirdPartyMessagePrecondition"]
  >,
  action: ActionType<typeof getMessagePrecondition.request>
) {
  const { id, categoryTag } = action.payload;

  try {
    const result = (yield* call(
      withRefreshApiCall,
      getThirdPartyMessagePrecondition({ id }),
      action
    )) as unknown as SagaCallReturnType<
      typeof getThirdPartyMessagePrecondition
    >;

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
    trackDisclaimerLoadError(categoryTag);
    yield* put(getMessagePrecondition.failure(convertUnknownToError(e)));
  }
}

export function* handleMessagePrecondition(
  getThirdPartyMessagePrecondition: BackendClient["getThirdPartyMessagePrecondition"],
  action: ActionType<typeof getMessagePrecondition.request>
) {
  yield* race({
    response: call(
      messagePreconditionWorker,
      getThirdPartyMessagePrecondition(),
      action
    ),
    cancel: take(clearMessagePrecondition)
  });
}
