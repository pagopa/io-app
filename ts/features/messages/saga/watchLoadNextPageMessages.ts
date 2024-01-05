import { put, takeLatest, call } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { PaginatedPublicMessagesCollection } from "../../../../definitions/backend/PaginatedPublicMessagesCollection";
import { BackendClient } from "../../../api/backend";
import { loadNextPageMessages as loadNextPageMessagesAction } from "../../../store/actions/messages";
import { toUIMessage } from "../../../store/reducers/entities/messages/transformers";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../types/utils";
import { isTestEnv } from "../../../utils/environment";
import { convertUnknownToError, getError } from "../../../utils/errors";
import { withRefreshApiCall } from "../../fastLogin/saga/utils";
import { errorToReason, unknownToReason } from "../utils";
import { trackLoadNextPageMessagesFailure } from "../analytics";
import { handleResponse } from "../utils/responseHandling";

type LocalActionType = ActionType<
  (typeof loadNextPageMessagesAction)["request"]
>;
type LocalBeClient = ReturnType<typeof BackendClient>["getMessages"];

export default function* watcher(
  getMessages: LocalBeClient
): Generator<ReduxSagaEffect, void, SagaCallReturnType<typeof getMessages>> {
  yield* takeLatest(
    getType(loadNextPageMessagesAction.request),
    tryLoadNextPageMessages(getMessages)
  );
}

function tryLoadNextPageMessages(getMessages: LocalBeClient) {
  return function* gen(
    action: LocalActionType
  ): Generator<ReduxSagaEffect, void, SagaCallReturnType<typeof getMessages>> {
    const { filter, pageSize, cursor } = action.payload;
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
            filter
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
  };
}

export const testTryLoadNextPageMessages = isTestEnv
  ? tryLoadNextPageMessages
  : undefined;
