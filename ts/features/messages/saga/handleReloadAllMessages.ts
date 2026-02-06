import { call, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import {
  reloadAllMessages,
  reloadAllMessages as reloadAllMessagesAction
} from "../store/actions";
import { SagaCallReturnType } from "../../../types/utils";
import { toUIMessage } from "../store/reducers/transformers";
import { getError } from "../../../utils/errors";
import { withRefreshApiCall } from "../../authentication/fastLogin/saga/utils";
import { errorToReason, unknownToReason } from "../utils";
import {
  trackReloadAllMessagesFailure,
  trackUndefinedBearerToken,
  UndefinedBearerTokenPhase
} from "../analytics";
import { handleResponse } from "../utils/responseHandling";
import { backendClientManager } from "../../../api/BackendClientManager";
import { apiUrlPrefix } from "../../../config";
import { sessionTokenSelector } from "../../authentication/common/store/selectors";
import { PaginatedPublicMessagesCollection } from "../../../../definitions/backend/communication/PaginatedPublicMessagesCollection";

export function* handleReloadAllMessages(
  action: ActionType<typeof reloadAllMessages.request>
) {
  const { filter, pageSize, fromUserAction } = action.payload;

  const sessionToken = yield* select(sessionTokenSelector);

  if (!sessionToken) {
    trackUndefinedBearerToken(
      UndefinedBearerTokenPhase.reloadAllMessagesLoading
    );
    return;
  }

  const { getUserMessages } =
    backendClientManager.getCommunicationBackendClient(
      apiUrlPrefix,
      sessionToken
    );

  try {
    const response: SagaCallReturnType<typeof getUserMessages> = (yield* call(
      withRefreshApiCall,
      getUserMessages({
        Bearer: "",
        enrich_result_data: true,
        page_size: pageSize,
        archived: filter.getArchived
      }),
      action
    )) as unknown as SagaCallReturnType<typeof getUserMessages>;
    const nextAction = handleResponse<PaginatedPublicMessagesCollection>(
      response,
      ({ items, next, prev }: PaginatedPublicMessagesCollection) =>
        reloadAllMessagesAction.success({
          messages: items.map(toUIMessage),
          pagination: { previous: prev, next },
          filter,
          fromUserAction
        }),
      error => {
        const reason = errorToReason(error);
        trackReloadAllMessagesFailure(reason);
        return reloadAllMessagesAction.failure({
          error: getError(error),
          filter
        });
      }
    );

    if (nextAction) {
      yield* put(nextAction);
    }
  } catch (error) {
    const reason = unknownToReason(error);
    trackReloadAllMessagesFailure(reason);
    yield* put(
      reloadAllMessagesAction.failure({
        error: getError(error),
        filter
      })
    );
  }
}
