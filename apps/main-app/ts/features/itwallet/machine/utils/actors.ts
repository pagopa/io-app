import { fromCallback } from "xstate";

import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import { MachineStore } from "./deps";

export type WaitForSessionRefreshInput = {
  deps: {
    store: MachineStore;
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
