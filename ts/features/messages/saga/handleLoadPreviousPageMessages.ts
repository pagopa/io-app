import { call, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { loadPreviousPageMessages as loadPreviousPageMessagesAction } from "../store/actions";
import { SagaCallReturnType } from "../../../types/utils";
import { toUIMessage } from "../store/reducers/transformers";
import { PaginatedPublicMessagesCollection } from "../../../../definitions/backend/PaginatedPublicMessagesCollection";
import { convertUnknownToError, getError } from "../../../utils/errors";
import { withRefreshApiCall } from "../../authentication/fastLogin/saga/utils";
import { errorToReason, unknownToReason } from "../utils";
import { trackLoadPreviousPageMessagesFailure } from "../analytics";
import { handleResponse } from "../utils/responseHandling";
import { sessionTokenSelector } from "../../authentication/common/store/selectors";
import { backendClientManager } from "../../../api/BackendClientManager";
import { apiUrlPrefix } from "../../../config";

export function* handleLoadPreviousPageMessages(
  action: ActionType<typeof loadPreviousPageMessagesAction.request>
) {
  const { filter, cursor, pageSize, fromUserAction } = action.payload;

  const sessionToken = yield* select(sessionTokenSelector);

  if (!sessionToken) {
    return;
  }

  const { getMessages } = backendClientManager.getBackendClient(
    apiUrlPrefix,
    sessionToken
  );

  try {
    const response = (yield* call(
      withRefreshApiCall,
      getMessages({
        enrich_result_data: true,
        page_size: pageSize,
        minimum_id: cursor,
        archived: filter.getArchived
      }),
      action
    )) as unknown as SagaCallReturnType<typeof getMessages>;
    const nextAction = handleResponse<PaginatedPublicMessagesCollection>(
      response,
      ({ items, prev }: PaginatedPublicMessagesCollection) =>
        loadPreviousPageMessagesAction.success({
          messages: items.map(toUIMessage),
          pagination: { previous: prev },
          filter,
          fromUserAction
        }),
      error => {
        const reason = errorToReason(error);
        trackLoadPreviousPageMessagesFailure(reason);
        return loadPreviousPageMessagesAction.failure({
          error: getError(error),
          filter
        });
      }
    );

    if (nextAction) {
      yield* put(nextAction);
    }
  } catch (e) {
    const reason = unknownToReason(e);
    trackLoadPreviousPageMessagesFailure(reason);
    yield* put(
      loadPreviousPageMessagesAction.failure({
        error: convertUnknownToError(e),
        filter
      })
    );
  }
}
