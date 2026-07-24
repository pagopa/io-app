import { isRight } from "fp-ts/lib/Either";
import { call, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";

import { CreatedMessageWithContentAndAttachments } from "../../../../definitions/communication/CreatedMessageWithContentAndAttachments";
import { SagaCallReturnType } from "../../../types/utils";
import { convertUnknownToError } from "../../../utils/errors";
import { sessionTokenSelector } from "../../authentication/common/store/selectors";
import { withRefreshApiCall } from "../../authentication/fastLogin/saga/utils";
import {
  trackLoadMessageByIdFailure,
  trackUndefinedBearerToken,
  UndefinedBearerTokenPhase
} from "../analytics";
import { loadMessageById, LoadMessageByIdFailureKind } from "../store/actions";
import { toUIMessage } from "../store/reducers/transformers";
import { errorToReason, unknownToReason } from "../utils";
import { handleResponse } from "../utils/responseHandling";
import { getCommunicationClient } from "./commons";

export function* handleLoadMessageById(
  action: ActionType<typeof loadMessageById.request>
) {
  const id = action.payload.id;

  const sessionToken = yield* select(sessionTokenSelector);

  if (!sessionToken) {
    yield* call(
      trackUndefinedBearerToken,
      UndefinedBearerTokenPhase.messageByIdLoading
    );
    return;
  }

  const { getUserMessage: getMessage } = yield* call(
    getCommunicationClient,
    sessionToken
  );

  try {
    const response = (yield* call(
      withRefreshApiCall,
      getMessage({
        id,
        public_message: true
      }),
      action
    )) as SagaCallReturnType<typeof getMessage>;

    const errorKind: LoadMessageByIdFailureKind =
      isRight(response) && response.right.status === 404
        ? "messageNotFound"
        : "generic";

    const nextAction = yield* call(
      handleResponse<CreatedMessageWithContentAndAttachments>,
      response,
      (message: CreatedMessageWithContentAndAttachments) =>
        loadMessageById.success(toUIMessage(message)),
      error => {
        const reason = errorToReason(error);
        trackLoadMessageByIdFailure(reason);
        return loadMessageById.failure({ id, error, kind: errorKind });
      }
    );
    if (nextAction) {
      yield* put(nextAction);
    }
  } catch (e) {
    const reason = unknownToReason(e);
    trackLoadMessageByIdFailure(reason);
    yield* put(
      loadMessageById.failure({
        id,
        error: convertUnknownToError(e),
        kind: "generic"
      })
    );
  }
}
