import { call, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { convertUnknownToError } from "../../../utils/errors";
import { loadMessageById } from "../store/actions";
import { toUIMessage } from "../store/reducers/transformers";
import { CreatedMessageWithContentAndAttachments } from "../../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { withRefreshApiCall } from "../../authentication/fastLogin/saga/utils";
import { SagaCallReturnType } from "../../../types/utils";
import { errorToReason, unknownToReason } from "../utils";
import {
  trackLoadMessageByIdFailure,
  trackUndefinedBearerToken,
  UndefinedBearerTokenPhase
} from "../analytics";
import { handleResponse } from "../utils/responseHandling";
import { backendClientManager } from "../../../api/BackendClientManager";
import { apiUrlPrefix } from "../../../config";
import { sessionTokenSelector } from "../../authentication/common/store/selectors";

export function* handleLoadMessageById(
  action: ActionType<typeof loadMessageById.request>
) {
  const id = action.payload.id;

  const sessionToken = yield* select(sessionTokenSelector);

  if (!sessionToken) {
    trackUndefinedBearerToken(UndefinedBearerTokenPhase.messageByIdLoading);
    return;
  }

  const { getMessage } = backendClientManager.getBackendClient(
    apiUrlPrefix,
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
    )) as unknown as SagaCallReturnType<typeof getMessage>;
    const nextAction = handleResponse(
      response,
      (message: CreatedMessageWithContentAndAttachments) =>
        loadMessageById.success(toUIMessage(message)),
      error => {
        const reason = errorToReason(error);
        trackLoadMessageByIdFailure(reason);
        return loadMessageById.failure({ id, error });
      }
    );
    if (nextAction) {
      yield* put(nextAction);
    }
  } catch (e) {
    const reason = unknownToReason(e);
    trackLoadMessageByIdFailure(reason);
    yield* put(
      loadMessageById.failure({ id, error: convertUnknownToError(e) })
    );
  }
}
