import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { call, put, race, select, take } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { BackendClient } from "../../../api/backend";
import { convertUnknownToError } from "../../../utils/errors";
import { isTestEnv } from "../../../utils/environment";
import { withRefreshApiCall } from "../../fastLogin/saga/utils";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../types/utils";
import { trackDisclaimerLoadError } from "../analytics";
import {
  errorPreconditionStatusAction,
  idlePreconditionStatusAction,
  loadingContentPreconditionStatusAction,
  retrievingDataPreconditionStatusAction,
  toErrorPayload,
  toLoadingContentPayload
} from "../store/actions/preconditions";
import { UIMessageId } from "../types";
import { MessageCategory } from "../../../../definitions/backend/MessageCategory";
import {
  preconditionsCategoryTagSelector,
  preconditionsMessageIdSelector
} from "../store/reducers/messagePrecondition";
import { isIOMarkdownEnabledOnMessagesAndServicesSelector } from "../../../store/reducers/persistedPreferences";

export function* handleMessagePrecondition(
  getThirdPartyMessagePrecondition: BackendClient["getThirdPartyMessagePrecondition"],
  action: ActionType<typeof retrievingDataPreconditionStatusAction>
) {
  yield* race({
    response: call(
      messagePreconditionWorker,
      getThirdPartyMessagePrecondition(),
      action
    ),
    cancel: take(idlePreconditionStatusAction)
  });
}

function* messagePreconditionWorker(
  getThirdPartyMessagePrecondition: ReturnType<
    BackendClient["getThirdPartyMessagePrecondition"]
  >,
  action: ActionType<typeof retrievingDataPreconditionStatusAction>
) {
  const messageIdAndCategoryTag = yield* call(getMessageIdAndCategoryTag);
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
        const isIOMarkdownEnabled = yield* select(
          isIOMarkdownEnabledOnMessagesAndServicesSelector
        );
        yield* put(
          loadingContentPreconditionStatusAction(
            toLoadingContentPayload(content, isIOMarkdownEnabled)
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
    yield* put(
      errorPreconditionStatusAction(
        toErrorPayload(`${convertUnknownToError(e)}`)
      )
    );
  }
}

export function* getMessageIdAndCategoryTag(): Generator<
  ReduxSagaEffect,
  { messageId: UIMessageId; categoryTag: MessageCategory["tag"] } | undefined,
  any
> {
  const messageId = yield* select(preconditionsMessageIdSelector);
  const categoryTag = yield* select(preconditionsCategoryTagSelector);
  return messageId && categoryTag
    ? {
        messageId,
        categoryTag
      }
    : undefined;
}

export const testMessagePreconditionWorker = isTestEnv
  ? messagePreconditionWorker
  : undefined;
