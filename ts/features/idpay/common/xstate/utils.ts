import { DefaultContext } from "xstate";
import { E_BACK } from "./events";

type WrappedAction<TContext> = (context: TContext, event: any) => void;
type Events = { type: string } | E_BACK;

/**
 * Checks if the event is of type E_BACK
 * @param event The event object to check.
 * @returns True if the event is of type E_BACK, false otherwise.
 */
const isBack = (event: Events): event is E_BACK => event.type === "BACK";

/**
 * Checks if a given event should skip the navigation action.
 * @param event The event object to check.
 * @returns True if the event is of type E_BACK and has a skipNavigation property set to true; otherwise, false.
 */
const skipNavigation = (event: Events) => isBack(event) && event.skipNavigation;

/**
 * Wrap an action function with a guard clause that checks whether the event should be skipped.
 * @param action - The original action function to wrap.
 * @returns  A new function that takes a context and event object
 * and either skips the action or calls the original action based on the event.
 */
export const guardedNavigationAction =
  <TContext = DefaultContext>(action: WrappedAction<TContext>) =>
  (context: TContext, event: any) => {
    /**
     * Check if the event should be skipped. If so, return immediately without calling the action.
     */
    if (skipNavigation(event)) {
      return;
    }
    /**
     * If the event should not be skipped, call the original action function with the provided context and event objects.
     */
    return action(context, event);
  };
