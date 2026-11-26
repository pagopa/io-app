import { put, select } from "typed-redux-saga/macro";
import { isActionOf } from "typesafe-actions";

import { pageSize } from "../../../config";
import { isLoadingOrUpdating } from "../../../utils/pot";
import { fastLoginPendingActionsSelector } from "../../authentication/fastLogin/store/selectors";
import { reloadAllMessages } from "../store/actions";
import { allPaginatedSelector } from "../store/reducers/allPaginated";
import { Collection } from "../store/reducers/allPaginated/types";

/**
 * Re-dispatches the message list reloads interrupted by a startup restart (e.g.
 * the fast-login token refresh), which cancels the message sagas without
 * clearing the lists' loading state.
 *
 * It must run right after the message watchers are registered: no list request
 * can be in flight at that point, so a loading list can only be left over by a
 * cancelled request. Only full reloads are recovered, since they are the ones
 * running at startup: interrupted next/previous page loads are not handled.
 * Inbox and archive share the same `takeLatest` watcher, so reloading both
 * would cancel the first one: this cannot happen because the UI never starts a
 * list request while either list is loading.
 *
 * Reloads already saved by the fast-login refresh are skipped, since they are
 * dispatched again once the application is initialized.
 */
export function* handleInterruptedMessageListRequests() {
  const { archive, inbox } = yield* select(allPaginatedSelector);
  yield* reloadIfInterrupted(archive, true);
  yield* reloadIfInterrupted(inbox, false);
}

function* reloadIfInterrupted(collection: Collection, getArchived: boolean) {
  if (
    collection.lastRequest !== "all" ||
    !isLoadingOrUpdating(collection.data)
  ) {
    return;
  }
  const pendingActions = yield* select(fastLoginPendingActionsSelector);
  const isPending = pendingActions.some(
    action =>
      isActionOf(reloadAllMessages.request, action) &&
      !!action.payload.filter.getArchived === getArchived
  );
  if (!isPending) {
    yield* put(
      reloadAllMessages.request({
        pageSize,
        filter: { getArchived },
        fromUserAction: false
      })
    );
  }
}
