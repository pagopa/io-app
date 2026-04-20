import { fromCallback } from "xstate";
import { useIOStore } from "../../../../store/hooks";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";

/**
 * Create actors that are shared across multiple IT-Wallet state machines.
 *
 * @param store The Redux store
 * @returns An object with actors implementation
 */
export const createCommonActorsImplementation = (
  store: ReturnType<typeof useIOStore>
) => ({
  /**
   * Actor that waits for the session token to be refreshed in the Redux store.
   * When the token is updated, it notifies the parent machine with a
   * `session-refresh-complete` event.
   */
  waitForSessionRefresh: fromCallback(({ sendBack }) => {
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
  })
});
