import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { call, put, race, select, take } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";

import { MessageCategory } from "../../../../definitions/communication/MessageCategory";
import { CommunicationClient } from "../../../api/CommunicationClientManager";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../types/utils";
import { isTestEnv } from "../../../utils/environment";
import { convertUnknownToError } from "../../../utils/errors";
import { sessionTokenSelector } from "../../authentication/common/store/selectors";
import { withRefreshApiCall } from "../../authentication/fastLogin/saga/utils";
import {
  trackDisclaimerLoadError,
  trackUndefinedBearerToken,
  UndefinedBearerTokenPhase
} from "../analytics";
import {
  errorPreconditionStatusAction,
  idlePreconditionStatusAction,
  loadingContentPreconditionStatusAction,
  retrievingDataPreconditionStatusAction,
  toErrorPayload,
  toLoadingContentPayload
} from "../store/actions/preconditions";
import {
  preconditionsCategoryTagSelector,
  preconditionsMessageIdSelector
} from "../store/reducers/messagePrecondition";
import { getCommunicationClient } from "./commons";

export function* getMessageIdAndCategoryTag(): Generator<
  ReduxSagaEffect,
  undefined | { categoryTag: MessageCategory["tag"]; messageId: string },
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

export function* handleMessagePrecondition(
  action: ActionType<typeof retrievingDataPreconditionStatusAction>
) {
  const sessionToken = yield* select(sessionTokenSelector);

  if (!sessionToken) {
    trackUndefinedBearerToken(
      UndefinedBearerTokenPhase.thirdPartyMessagePrecondition
    );
    return;
  }

  const { getThirdPartyMessagePrecondition } = yield* call(
    getCommunicationClient,
    sessionToken
  );

  yield* race({
    response: call(
      messagePreconditionWorker,
      getThirdPartyMessagePrecondition,
      action
    ),
    cancel: take(idlePreconditionStatusAction)
  });
}

function* messagePreconditionWorker(
  getThirdPartyMessagePrecondition: CommunicationClient["getThirdPartyMessagePrecondition"],
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
    yield* put(
      errorPreconditionStatusAction(
        toErrorPayload(`${convertUnknownToError(e)}`)
      )
    );
  }
}

export const testMessagePreconditionWorker = isTestEnv
  ? { messagePreconditionWorker }
  : undefined;
