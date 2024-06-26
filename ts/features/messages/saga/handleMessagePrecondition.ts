import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { call, put, race, select, take } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { BackendClient } from "../../../api/backend";
import { convertUnknownToError } from "../../../utils/errors";
import { isTestEnv } from "../../../utils/environment";
import { withRefreshApiCall } from "../../fastLogin/saga/utils";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../types/utils";
import { trackDisclaimerLoadError } from "../analytics";
import {
  clearMessagePrecondition,
  errorPreconditionStatusAction,
  getMessagePrecondition,
  loadingContentPreconditionStatusAction,
  retrievingDataPreconditionStatusAction,
  toErrorPayload,
  toLoadingContentPayload
} from "../store/actions/preconditions";
import { scheduledStatePayloadSelector } from "../store/reducers/messagePrecondition";
import { UIMessageId } from "../types";

  export function* handleMessagePrecondition(
    getThirdPartyMessagePrecondition: BackendClient["getThirdPartyMessagePrecondition"],
    action: ActionType<typeof getMessagePrecondition.request> | ActionType<typeof retrievingDataPreconditionStatusAction>
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

function* messagePreconditionWorker(
  getThirdPartyMessagePrecondition: ReturnType<
    BackendClient["getThirdPartyMessagePrecondition"]
  >,
  action: ActionType<typeof getMessagePrecondition.request> | ActionType<typeof retrievingDataPreconditionStatusAction>
) {
  const messageIdAndCategoryTag = yield* call(getMessageIdAndCategoryTag, action);
  try {
    if (!messageIdAndCategoryTag) {
      throw Error("Unable to get `messageId` or `categoryTag`"); 
    }

    const result = (yield* call(
      withRefreshApiCall,
      getThirdPartyMessagePrecondition({ id: messageIdAndCategoryTag.messageId }),
      action
    )) as unknown as SagaCallReturnType<
      typeof getThirdPartyMessagePrecondition
    >;

    if (E.isRight(result)) {
      if (result.right.status === 200) {
        const content = result.right.value;
        yield* put(getMessagePrecondition.success(content));
        yield* put(loadingContentPreconditionStatusAction(toLoadingContentPayload(content)));
        return;
      }
      throw Error(`response status ${result.right.status}`);
    } else {
      throw Error(readableReport(result.left));
    }
  } catch (e) {
    trackDisclaimerLoadError(messageIdAndCategoryTag?.categoryTag ?? "UNKNOWN");
    yield* put(getMessagePrecondition.failure(convertUnknownToError(e)));
    yield* put(errorPreconditionStatusAction(toErrorPayload(`${convertUnknownToError(e)}`)));
  }
}

function* getMessageIdAndCategoryTag(
  action: ActionType<typeof getMessagePrecondition.request> | ActionType<typeof retrievingDataPreconditionStatusAction>
): Generator<ReduxSagaEffect, { messageId: UIMessageId, categoryTag: string } | undefined, any> {
  if (action.type === getType(getMessagePrecondition.request)){ 
    return {
      messageId: action.payload.id,
      categoryTag: action.payload.categoryTag
    };
  }

  return yield* select(scheduledStatePayloadSelector);
}

export const testMessagePreconditionWorker = isTestEnv
  ? messagePreconditionWorker
  : undefined;
