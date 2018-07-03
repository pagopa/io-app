import Mixpanel from "react-native-mixpanel";
import { NavigationActions } from "react-navigation";

import {
  APP_STATE_CHANGE_ACTION,
  NOTIFICATIONS_INSTALLATION_UPDATE_FAILURE
} from "../store/actions/constants";
import { Action, Dispatch, MiddlewareAPI } from "../store/actions/types";

/*
 * The middleware acts as a general hook in order to track any meaningful action
 */
export function actionTracking(): (_: Dispatch) => (_: Action) => Action {
  return (next: Dispatch): ((_: Action) => Action) => {
    return (action: Action): Action => {
      const result: Action = next(action);

      switch (result.type) {
        case APP_STATE_CHANGE_ACTION: {
          Mixpanel.trackWithProperties("APP_STATE_CHANGE", {
            APPLICATION_STATE_NAME: result.payload
          });
          break;
        }

        case NOTIFICATIONS_INSTALLATION_UPDATE_FAILURE: {
          Mixpanel.track(NOTIFICATIONS_INSTALLATION_UPDATE_FAILURE);
        }

        /*
        case USER_WILL_LOGIN_ACTION: {
          Mixpanel.track('USER_WILL_LOGIN')
          break
        }
        case USER_SELECTED_SPID_PROVIDER_ACTION: {
          const { id, name } = result.data.idp
          Mixpanel.trackWithProperties('USER_SELECTED_SPID_PROVIDER', {
            SPID_IDP_ID: id,
            SPID_IDP_NAME: name
          })
          break
        }
        case USER_LOGGED_IN_ACTION: {
          const { idpId } = result.data
          Mixpanel.trackWithProperties('USER_LOGGED_IN', {
            SPID_IDP_ID: idpId
          })
          break
        }
        case USER_LOGIN_ERROR_ACTION: {
          const { error } = result.data
          Mixpanel.trackWithProperties('USER_LOGIN_ERROR', {
            error
          })
          break
        }
        case REHYDRATE: {
          if (!has(result, 'payload.user.profile.fiscalnumber')) {
            break
          }

          const { fiscalnumber } = result.payload.user.profile
          sha256(fiscalnumber).then(hash => {
            Mixpanel.identify(hash)
            Mixpanel.set({
              fiscalnumber: hash
            })
          })
          break
        }
        */

        default: {
          break;
        }
      }

      return result;
    };
  };
}

// gets the current screen from navigation state
// TODO: Need to be fixed
export function getCurrentRouteName(navNode: any): string | undefined {
  if (!navNode) {
    return undefined;
  }

  if (navNode.routeName && typeof navNode.routeName === "string") {
    // navNode is a NavigationLeafRoute
    return navNode.routeName;
  }

  if (navNode.routes && navNode.index && navNode.routes[navNode.index]) {
    const route = navNode.routes[navNode.index];
    return getCurrentRouteName(route);
  }

  return undefined;
}

/*
  The middleware acts as a general hook in order to track any meaningful navigation action
  https://reactnavigation.org/docs/guides/screen-tracking#Screen-tracking-with-Redux
*/
export function screenTracking(
  store: MiddlewareAPI
): (_: Dispatch) => (__: Action) => Action {
  return (next: Dispatch): ((_: Action) => Action) => {
    return (action: Action): Action => {
      if (
        action.type !== NavigationActions.NAVIGATE &&
        action.type !== NavigationActions.BACK
      ) {
        return next(action);
      }

      const currentScreen = getCurrentRouteName(store.getState().nav);
      const result = next(action);
      const nextScreen = getCurrentRouteName(store.getState().nav);

      if (nextScreen !== currentScreen) {
        Mixpanel.trackWithProperties("SCREEN_CHANGE", {
          SCREEN_NAME: nextScreen
        });
      }
      return result;
    };
  };
}
