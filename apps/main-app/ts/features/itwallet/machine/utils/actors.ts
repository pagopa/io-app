import { fromCallback } from "xstate";

import { useIOStore } from "../../../../store/hooks";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";

export type WaitForSessionRefreshInput = {
  deps: {
    store: ReturnType<typeof useIOStore>;
  };
};

/**
 * Actor that waits for the session token to be refreshed in the Redux store.
 * When the token is updated, it notifies the parent machine with a `session-refresh-complete` event.
 */
export const waitForSessionRefreshActor = fromCallback<
  { type: "session-refresh-complete" },
  WaitForSessionRefreshInput
>(({ sendBack, input }) => {
  const { store } = input.deps;
  const oldSessionToken = sessionTokenSelector(store.getState());

  const unsubscribe = store.subscribe(() => {
    const currentSessionToken = sessionTokenSelector(store.getState());
    if (currentSessionToken !== oldSessionToken) {
      sendBack({ type: "session-refresh-complete" });
    }
  });

  return () => {
    unsubscribe();
  };
});
