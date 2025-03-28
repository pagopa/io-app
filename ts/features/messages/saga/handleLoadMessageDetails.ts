import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { CreatedMessageWithContentAndAttachments } from "../../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { BackendClient } from "../../../api/backend";
import { loadMessageDetails } from "../store/actions";
import { SagaCallReturnType } from "../../../types/utils";
import { getError } from "../../../utils/errors";
import { toUIMessageDetails } from "../store/reducers/transformers";
import { withRefreshApiCall } from "../../identification/fastLogin/saga/utils";
import { errorToReason, unknownToReason } from "../utils";
import { trackLoadMessageDetailsFailure } from "../analytics";
import { handleResponse } from "../utils/responseHandling";

export function* handleLoadMessageDetails(
  getMessage: BackendClient["getMessage"],
  action: ActionType<typeof loadMessageDetails.request>
) {
  const id = action.payload.id;

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
