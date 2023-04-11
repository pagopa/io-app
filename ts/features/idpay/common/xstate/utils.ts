import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
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
 * Checks if an E_BACK event should skip the navigation action.
 * @param event The event object to check.
 * @returns True if the event has a skipNavigation property set to true; otherwise, false.
 */
const skipNavigation = (event: E_BACK) => event.skipNavigation || false;

/**
 * Wrap an action function with a guard clause that checks whether the event should be skipped.
 * @param action - The original action function to wrap.
 * @returns  A new function that takes a context and event object
 * and either skips the action or calls the original action based on the event.
 */
export const guardedNavigationAction =
  <TContext = DefaultContext>(action: WrappedAction<TContext>) =>
  (context: TContext, event: any) =>
    pipe(
      event,
      O.of,
      O.filter(isBack),
      O.filter(skipNavigation),
      O.fold(
        /**
         * The event is not of type E_BACK and/or does not contain the skipNavigation property.
         * WrappedAction should be executed.
         */
        () => action(context, event),
        /**
         * The event is of type E_BACK and contains the skipNavigation property.
         * No actions should be executed.
         */
        () => null
      )
    );
