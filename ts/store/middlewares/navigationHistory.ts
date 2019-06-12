import {
  NavigationActions,
  NavigationRoute,
  StackActions
} from "react-navigation";
import { Middleware } from "redux";

import { navigationRestore } from "../actions/navigation";
import {
  navigationHistoryMultiplePop,
  navigationHistoryPop,
  navigationHistoryPush,
  navigationHistoryReset
} from "../actions/navigationHistory";
import { Action, Dispatch, MiddlewareAPI } from "../actions/types";
import { GlobalState } from "../reducers/types";

// tslint:disable-next-line:cognitive-complexity
export function createNavigationHistoryMiddleware(): Middleware<
  Dispatch,
  GlobalState
> {
  // tslint:disable-next-line:no-let
  let firstRun = true;

  return (store: MiddlewareAPI) => (next: Dispatch) => (action: Action) => {
    switch (action.type) {
      case NavigationActions.INIT:
      case NavigationActions.NAVIGATE:
      case NavigationActions.SET_PARAMS:
      case StackActions.REPLACE:
      case StackActions.POP_TO_TOP: {
        // We don't need to store the history on first navigation
        if (firstRun) {
          firstRun = false;
          return next(action);
        }

        // Get the state before the react-navigation reducer
        const oldNavigationState = store.getState().nav;
        // Dispatch the original action
        const nextAction = next(action);
        // Get the state after the react-navigation reducer
        const newNavigationState = store.getState().nav;
        // If the old state is different from the new state
        if (newNavigationState !== oldNavigationState) {
          // Dispatch an action to push the old state into the navigation history
          store.dispatch(navigationHistoryPush(oldNavigationState));
        }
        return nextAction;
      }

      case StackActions.RESET: {
        // If the RESET is the first navigation action we need to set first run to false
        if (firstRun) {
          firstRun = false;
        }

        /**
         * Dispatch an action to reset the history.
         */
        store.dispatch(navigationHistoryReset());
        return next(action);
      }
      case NavigationActions.BACK: {
        const routeKey = action.key;

        // Get the current navigation history
        const currentNavigationHistory = store.getState().navigationHistory;

        // If the history is empty we just need to return
        if (currentNavigationHistory.length === 0) {
          return;
        }

        // Get the previous navigation state
        const previousNavigationState = {
          ...currentNavigationHistory[currentNavigationHistory.length - 1]
        };

        if (routeKey !== undefined && routeKey !== null) {
          const isSingleBack = !navigationStateRoutesContainsKey(
            previousNavigationState.routes,
            routeKey
          );
          if (isSingleBack) {
            // Pop the last element from the history
            store.dispatch(navigationHistoryPop());
            // Dispatch an action to restore the previous state
            store.dispatch(navigationRestore(previousNavigationState));
          } else {
            // Search for the index where the route is present for the first time
            const index = currentNavigationHistory.findIndex(
              navigationState => {
                return navigationStateRoutesContainsKey(
                  navigationState.routes,
                  routeKey
                );
              }
            );
            // Calculate the number of pop to do for return to the route
            const nPop = currentNavigationHistory.length - index;

            const backNavigationState = {
              ...currentNavigationHistory[index]
            };

            // Pop to route
            store.dispatch(navigationHistoryMultiplePop(nPop));
            // Dispatch an action to restore the state where go back
            store.dispatch(navigationRestore(backNavigationState));
          }
        } else {
          // Pop the last element from the history
          store.dispatch(navigationHistoryPop());
          // Dispatch an action to restore the previous state
          store.dispatch(navigationRestore(previousNavigationState));
        }
      }

      default:
        return next(action);
    }
  };
}

/*
* Check if the route key is present in routes of navigation state
*/
export function navigationStateRoutesContainsKey(
  routes: ReadonlyArray<NavigationRoute>,
  routeKey: string
): boolean {
  const index = routes.findIndex(r => {
    return (
      // Check if the route is the one we want
      r.key === routeKey ||
      // Or if this is a nested Navigator route, recursively check to see if
      // its children match
      !!(r.routes && navigationStateRoutesContainsKey(r.routes, routeKey))
    );
  });

  const notFound = -1;
  return index !== notFound;
}
