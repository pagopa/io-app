import { put, call, select } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { PaginatedPublicMessagesCollection } from "../../../../definitions/communication/PaginatedPublicMessagesCollection";
import {
  loadNextPageMessages,
  loadPreviousPageMessages
} from "../store/actions";
import { toUIMessage } from "../store/reducers/transformers";
import { SagaCallReturnType } from "../../../types/utils";
import { convertUnknownToError, getError } from "../../../utils/errors";
import { withRefreshApiCall } from "../../authentication/fastLogin/saga/utils";
import { errorToReason, unknownToReason } from "../utils";
import {
  trackLoadNextPageMessagesFailure,
  trackLoadPreviousPageMessagesFailure,
  trackUndefinedBearerToken,
  UndefinedBearerTokenPhase
} from "../analytics";
import { handleResponse } from "../utils/responseHandling";
import { sessionTokenSelector } from "../../authentication/common/store/selectors";
import { getCommunicationClient } from "./commons";

const loadPageMessageUtils = (isFetchingNextPage: boolean) => {
  const loadMessagePageAction = isFetchingNextPage
    ? loadNextPageMessages
    : loadPreviousPageMessages;
  const phase = isFetchingNextPage
    ? UndefinedBearerTokenPhase.nextPageMessagesLoading
    : UndefinedBearerTokenPhase.previousPageMessagesLoading;
  const trackMessagePageFailure = isFetchingNextPage
    ? trackLoadNextPageMessagesFailure
    : trackLoadPreviousPageMessagesFailure;
  return { loadMessagePageAction, phase, trackMessagePageFailure };
};

export function* handleLoadPageMessages(
  action:
    | ActionType<typeof loadPreviousPageMessages.request>
    | ActionType<typeof loadNextPageMessages.request>
) {
  const { filter, pageSize, cursor, fromUserAction } = action.payload;
  const isNext = action.type === getType(loadNextPageMessages.request);
  const { loadMessagePageAction, phase, trackMessagePageFailure } =
    loadPageMessageUtils(isNext);

  const sessionToken = yield* select(sessionTokenSelector);

  if (!sessionToken) {
    trackUndefinedBearerToken(phase);
    return;
  }

  const { getUserMessages: getMessages } = yield* call(
    getCommunicationClient,
    sessionToken
  );

  try {
    const cursorInfo = isNext ? { maximum_id: cursor } : { minimum_id: cursor };
    const response = (yield* call(
      withRefreshApiCall,
      getMessages({
        enrich_result_data: true,
        page_size: pageSize,
        ...cursorInfo,
        archived: filter.getArchived
      }),
      action
    )) as SagaCallReturnType<typeof getMessages>;

    const nextAction = handleResponse<PaginatedPublicMessagesCollection>(
      response,
      ({ items, next, prev: previous }: PaginatedPublicMessagesCollection) =>
        loadMessagePageAction.success({
          messages: items.map(toUIMessage),
          pagination: isNext ? { next } : { previous },
          filter,
          fromUserAction
        }),
      error => {
        const reason = errorToReason(error);
        trackMessagePageFailure(reason);
        return loadMessagePageAction.failure({
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
    trackMessagePageFailure(reason);
    yield* put(
      loadMessagePageAction.failure({
        error: convertUnknownToError(e),
        filter
      })
    );
  }
}
