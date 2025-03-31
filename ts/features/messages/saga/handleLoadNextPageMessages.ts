import { put, call } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { PaginatedPublicMessagesCollection } from "../../../../definitions/backend/PaginatedPublicMessagesCollection";
import { BackendClient } from "../../../api/backend";
import {
  loadNextPageMessages,
  loadNextPageMessages as loadNextPageMessagesAction
} from "../store/actions";
import { toUIMessage } from "../store/reducers/transformers";
import { SagaCallReturnType } from "../../../types/utils";
import { convertUnknownToError, getError } from "../../../utils/errors";
import { withRefreshApiCall } from "../../authentication/fastLogin/saga/utils";
import { errorToReason, unknownToReason } from "../utils";
import { trackLoadNextPageMessagesFailure } from "../analytics";
import { handleResponse } from "../utils/responseHandling";

export function* handleLoadNextPageMessages(
  getMessages: BackendClient["getMessages"],
  action: ActionType<typeof loadNextPageMessages.request>
) {
  const { filter, pageSize, cursor, fromUserAction } = action.payload;

  try {
    const response = (yield* call(
      withRefreshApiCall,
      getMessages({
        enrich_result_data: true,
        page_size: pageSize,
        maximum_id: cursor,
        archived: filter.getArchived
      }),
      action
    )) as unknown as SagaCallReturnType<typeof getMessages>;
    const nextAction = handleResponse<PaginatedPublicMessagesCollection>(
      response,
      ({ items, next }: PaginatedPublicMessagesCollection) =>
        loadNextPageMessagesAction.success({
          messages: items.map(toUIMessage),
          pagination: { next },
          filter,
          fromUserAction
        }),
      error => {
        const reason = errorToReason(error);
        trackLoadNextPageMessagesFailure(reason);
        return loadNextPageMessagesAction.failure({
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
    trackLoadNextPageMessagesFailure(reason);
    yield* put(
      loadNextPageMessagesAction.failure({
        error: convertUnknownToError(e),
        filter
      })
    );
  }
}
