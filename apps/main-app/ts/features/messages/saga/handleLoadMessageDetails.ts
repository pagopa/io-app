import { call, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";

import { CreatedMessageWithContentAndAttachments } from "../../../../definitions/communication/CreatedMessageWithContentAndAttachments";
import { SagaCallReturnType } from "../../../types/utils";
import { getError } from "../../../utils/errors";
import { sessionTokenSelector } from "../../authentication/common/store/selectors";
import { withRefreshApiCall } from "../../authentication/fastLogin/saga/utils";
import {
  trackLoadMessageDetailsFailure,
  trackUndefinedBearerToken,
  UndefinedBearerTokenPhase
} from "../analytics";
import { loadMessageDetails } from "../store/actions";
import { toUIMessageDetails } from "../store/reducers/transformers";
import { errorToReason, unknownToReason } from "../utils";
import { handleResponse } from "../utils/responseHandling";
import { getCommunicationClient } from "./commons";

export function* handleLoadMessageDetails(
  action: ActionType<typeof loadMessageDetails.request>
) {
  const id = action.payload.id;

  const sessionToken = yield* select(sessionTokenSelector);

  if (!sessionToken) {
    trackUndefinedBearerToken(UndefinedBearerTokenPhase.messageDetailLoading);
    return;
  }

  const { getUserMessage: getMessage } = yield* call(
    getCommunicationClient,
    sessionToken
  );

  try {
    const response = (yield* call(
      withRefreshApiCall,
      getMessage({ id }),
      action
    )) as unknown as SagaCallReturnType<typeof getMessage>;
    const nextAction = handleResponse<CreatedMessageWithContentAndAttachments>(
      response,
      (message: CreatedMessageWithContentAndAttachments) =>
        loadMessageDetails.success(toUIMessageDetails(message)),
      error => {
        const reason = errorToReason(error);
        trackLoadMessageDetailsFailure(reason);
        return loadMessageDetails.failure({
          id,
          error: getError(error)
        });
      }
    );

    if (nextAction) {
      yield* put(nextAction);
    }
  } catch (error) {
    const reason = unknownToReason(error);
    trackLoadMessageDetailsFailure(reason);
    yield* put(
      loadMessageDetails.failure({
        id,
        error: getError(error)
      })
    );
  }
}
