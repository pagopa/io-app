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
  clearLegacyMessagePrecondition,
  errorPreconditionStatusAction,
  getLegacyMessagePrecondition,
  loadingContentPreconditionStatusAction,
  retrievingDataPreconditionStatusAction,
  toErrorPayload,
  toLoadingContentPayload
} from "../store/actions/preconditions";
import { scheduledStatePayloadSelector } from "../store/reducers/messagePrecondition";
import { UIMessageId } from "../types";
import { MessageCategory } from "../../../../definitions/backend/MessageCategory";

export function* handleMessagePrecondition(
  getThirdPartyMessagePrecondition: BackendClient["getThirdPartyMessagePrecondition"],
  action:
    | ActionType<typeof getLegacyMessagePrecondition.request>
    | ActionType<typeof retrievingDataPreconditionStatusAction>
) {
  yield* race({
    response: call(
      messagePreconditionWorker,
      getThirdPartyMessagePrecondition(),
      action
    ),
    cancel: take(clearLegacyMessagePrecondition)
  });
}

function* messagePreconditionWorker(
  getThirdPartyMessagePrecondition: ReturnType<
    BackendClient["getThirdPartyMessagePrecondition"]
  >,
  action:
    | ActionType<typeof getLegacyMessagePrecondition.request>
    | ActionType<typeof retrievingDataPreconditionStatusAction>
) {
  const messageIdAndCategoryTag = yield* call(
    getMessageIdAndCategoryTag,
    action
  );
  try {
    if (!messageIdAndCategoryTag) {
      throw Error("Unable to get `messageId` or `categoryTag`");
    }

    const result = (yield* call(
      withRefreshApiCall,
      getThirdPartyMessagePrecondition({
        id: messageIdAndCategoryTag.messageId
      }),
      action
    )) as unknown as SagaCallReturnType<
      typeof getThirdPartyMessagePrecondition
    >;

    if (E.isRight(result)) {
      if (result.right.status === 200) {
        const content = result.right.value;
        yield* put(getLegacyMessagePrecondition.success(content));
        yield* put(
          loadingContentPreconditionStatusAction(
            toLoadingContentPayload(content)
          )
        );
        return;
      }
      throw Error(`response status ${result.right.status}`);
    } else {
      throw Error(readableReport(result.left));
    }
  } catch (e) {
    const categoryTag = messageIdAndCategoryTag?.categoryTag;
    if (categoryTag) {
      trackDisclaimerLoadError(categoryTag);
    }
    yield* put(getLegacyMessagePrecondition.failure(convertUnknownToError(e)));
    yield* put(
      errorPreconditionStatusAction(
        toErrorPayload(`${convertUnknownToError(e)}`)
      )
    );
  }
}

export function* getMessageIdAndCategoryTag(
  action:
    | ActionType<typeof getLegacyMessagePrecondition.request>
    | ActionType<typeof retrievingDataPreconditionStatusAction>
): Generator<
  ReduxSagaEffect,
  { messageId: UIMessageId; categoryTag: MessageCategory["tag"] } | undefined,
  any
> {
  if (action.type === getType(getLegacyMessagePrecondition.request)) {
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
