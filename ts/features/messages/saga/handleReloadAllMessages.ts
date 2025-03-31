import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { BackendClient } from "../../../api/backend";
import {
  reloadAllMessages,
  reloadAllMessages as reloadAllMessagesAction
} from "../store/actions";
import { SagaCallReturnType } from "../../../types/utils";
import { toUIMessage } from "../store/reducers/transformers";
import { PaginatedPublicMessagesCollection } from "../../../../definitions/backend/PaginatedPublicMessagesCollection";
import { getError } from "../../../utils/errors";
import { withRefreshApiCall } from "../../authentication/fastLogin/saga/utils";
import { errorToReason, unknownToReason } from "../utils";
import { trackReloadAllMessagesFailure } from "../analytics";
import { handleResponse } from "../utils/responseHandling";

export function* handleReloadAllMessages(
  getMessages: BackendClient["getMessages"],
  action: ActionType<typeof reloadAllMessages.request>
) {
  const { filter, pageSize, fromUserAction } = action.payload;

  try {
    const response: SagaCallReturnType<typeof getMessages> = (yield* call(
      withRefreshApiCall,
      getMessages({
        enrich_result_data: true,
        page_size: pageSize,
        archived: filter.getArchived
      }),
      action
    )) as unknown as SagaCallReturnType<typeof getMessages>;
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
