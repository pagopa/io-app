/**
 * Generators to manage messages and related services.
 */

import * as pot from "italia-ts-commons/lib/pot";

import { readableReport } from "italia-ts-commons/lib/reporters";
import { all, call, Effect, put, select, takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import { sessionExpired } from "../../store/actions/authentication";
import {
  loadMessage as loadMessageAction,
  loadMessages as loadMessagesAction,
  removeMessages as removeMessagesAction
} from "../../store/actions/messages";
import { loadServiceDetail } from "../../store/actions/services";
import { messagesAllIdsSelector } from "../../store/reducers/entities/messages/messagesAllIds";
import { messagesStateByIdSelector } from "../../store/reducers/entities/messages/messagesById";
import { messagesStatusSelector } from "../../store/reducers/entities/messages/messagesStatus";
import { servicesByIdSelector } from "../../store/reducers/entities/services/servicesById";
import { SagaCallReturnType } from "../../types/utils";
import { uniqueItem } from "../../utils/enumerables";
import { isDevEnv } from "../../utils/environment";

/**
 * A generator to load messages from the Backend.
 * The messages returned by the Backend are filtered so the application downloads
 * only the details of the messages and services not already in the redux store.
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
function* loadMessages(
  getMessages: ReturnType<typeof BackendClient>["getMessages"]
): Generator<Effect, void, any> {
  // We are using try...finally to manage task cancellation
  // @https://redux-saga.js.org/docs/advanced/TaskCancellation.html
  try {
    // Request the list of messages from the Backend
    // TODO: we will have to forward PaginationResponse data (page size, next)
    //       and persist it somewhere
    const response: SagaCallReturnType<typeof getMessages> = yield call(
      getMessages,
      {}
    );

    if (response.isLeft()) {
      throw Error(readableReport(response.value));
    }

    if (response.isRight()) {
      if (response.value.status === 401) {
        // on 401, expire the current session and restart the authentication flow
        yield put(sessionExpired());
        return;
      } else if (response.value.status !== 200) {
        // TODO: provide status code along with message in error https://www.pivotaltracker.com/story/show/170819193
        const error =
          response.value.status === 500 && response.value.value.title
            ? response.value.value.title
            : "";
        yield put(loadMessagesAction.failure(Error(error)));
      } else {
        // 200 ok
        const responseItemsIds = response.value.value.items.map(_ => _.id);

        yield put(loadMessagesAction.success(responseItemsIds));

        // Load already cached messages ids from the store
        const potCachedMessagesAllIds: ReturnType<
          typeof messagesAllIdsSelector
        > = yield select(messagesAllIdsSelector);
        const cachedMessagesAllIds = pot.getOrElse(potCachedMessagesAllIds, []);

        // Calculate the ids of the message no more visible that we need
        // to remove from the cache.
        const messageIds = cachedMessagesAllIds.filter(
          _ => responseItemsIds.indexOf(_) < 0
        );

        // Load already cached messages status ids from the store
        const messagesStatusMapping: ReturnType<typeof messagesStatusSelector> =
          yield select(messagesStatusSelector);
        const messagesStatusIds = Object.keys(messagesStatusMapping).filter(
          _ => responseItemsIds.indexOf(_) < 0
        );

        // Calculate the ids of the message no more visible that we need
        // to remove from the messagesStatus cache.
        const messagesIdsToRemoveFromCache = Array.from(
          new Set([...messageIds, ...messagesStatusIds])
        );

        // Remove the details of the no more visible messages from the
        // redux store.
        if (messagesIdsToRemoveFromCache.length > 0) {
          yield put(removeMessagesAction(messagesIdsToRemoveFromCache));
        }

        // The Backend returns the items from the oldest to the latest
        // but we want to process them from latest to oldest so we
        // reverse the order.
        // TODO: we will rely on API sorting since we use pagination
        const reversedItems = [...response.value.value.items].reverse();

        // Load already cached messages from the store
        const cachedMessagesById: ReturnType<typeof messagesStateByIdSelector> =
          yield select(messagesStateByIdSelector);

        // TODO: with the enrichment, we don't need to discern which messages to reload
        const shouldLoadMessage = (message: { id: string }) => {
          const cached = cachedMessagesById[message.id];
          return (
            cached === undefined ||
            pot.isNone(cached.message) ||
            pot.isError(cached.message)
          );
        };

        // Filter messages already in the store
        const pendingMessages = reversedItems.filter(shouldLoadMessage);

        // Load already cached services from the store
        const cachedServicesById: ReturnType<typeof servicesByIdSelector> =
          yield select(servicesByIdSelector);

        const shouldLoadService = (id: string) => {
          const cached = cachedServicesById[id];
          // we need to load a service if (one of these is true)
          // - service is not cached
          // - service is not loading AND (service is none OR service is error)
          return (
            cached === undefined ||
            (!pot.isLoading(cached) &&
              (pot.isNone(cached) || pot.isError(cached)))
          );
        };

        // Filter services already in the store
        const pendingServicesIds = pendingMessages
          .map(_ => _.sender_service_id)
          .filter(shouldLoadService)
          .filter(uniqueItem); // Get unique ids
        // Fetch the services detail in parallel
        // We don't need to store the results because the LOAD_SERVICE_DETAIL_REQUEST is already dispatched by each `loadServiceDetail` action called.
        // We fetch services first because to show messages you need the related service info
        yield all(
          pendingServicesIds.map(id => put(loadServiceDetail.request(id)))
        );

        // Fetch the messages detail in parallel
        // We don't need to store the results because the MESSAGE_LOAD_SUCCESS is already dispatched by each `loadMessage` action called,
        // in this way each message is stored as soon as the detail is fetched and the UI is more reactive.
        // TODO: with the enrichment, we don't need to load each message anymore
        yield all(pendingMessages.map(_ => put(loadMessageAction.request(_))));
      }
    }
  } catch (error) {
    // Dispatch failure action
    yield put(loadMessagesAction.failure(error));
  }
}

/**
 * This generator is an 'always running' task that waits for MESSAGES_LOAD_REQUEST.
 */
export function* watchLoadMessages(
  getMessages: ReturnType<typeof BackendClient>["getMessages"]
): Generator<Effect, void, any> {
  yield takeLatest(getType(loadMessagesAction.request), () =>
    loadMessages(getMessages)
  );
}

export const testLoadMessages = isDevEnv ? loadMessages : undefined;
