import { sha256 } from "react-native-sha256";
import { NavigationActions } from "react-navigation";

import { mixpanel } from "../../mixpanel";

import {
  ANALYTICS_AUTHENTICATION_COMPLETED,
  ANALYTICS_AUTHENTICATION_STARTED,
  ANALYTICS_ONBOARDING_STARTED,
  APP_STATE_CHANGE_ACTION,
  IDP_SELECTED,
  LOGIN_FAILURE,
  LOGIN_SUCCESS,
  LOGOUT_FAILURE,
  LOGOUT_SUCCESS,
  MESSAGES_LOAD_FAILURE,
  MESSAGES_LOAD_SUCCESS,
  NOTIFICATIONS_INSTALLATION_TOKEN_UPDATE,
  NOTIFICATIONS_INSTALLATION_UPDATE_FAILURE,
  PIN_CREATE_FAILURE,
  PIN_CREATE_SUCCESS,
  PROFILE_LOAD_FAILURE,
  PROFILE_LOAD_SUCCESS,
  PROFILE_UPSERT_FAILURE,
  PROFILE_UPSERT_SUCCESS,
  SESSION_EXPIRED,
  SESSION_INFO_LOAD_FAILURE,
  SESSION_INFO_LOAD_SUCCESS,
  TOS_ACCEPT_SUCCESS
} from "../actions/constants";
import { Action, Dispatch, MiddlewareAPI } from "../actions/types";

/*
 * The middleware acts as a general hook in order to track any meaningful action
 */
// tslint:disable-next-line:cognitive-complexity
export function actionTracking(): (_: Dispatch) => (_: Action) => Action {
  return (next: Dispatch): ((_: Action) => Action) => {
    return (action: Action): Action => {
      const nextAction: Action = next(action);

      switch (nextAction.type) {
        //
        // Application state actions
        //

        case APP_STATE_CHANGE_ACTION:
          if (mixpanel) {
            mixpanel
              .track("APP_STATE_CHANGE", {
                APPLICATION_STATE_NAME: nextAction.payload
              })
              .then(() => 0, () => 0);
          }
          break;

        //
        // Authentication actions (with properties)
        //

        case IDP_SELECTED:
          if (mixpanel) {
            mixpanel
              .track(IDP_SELECTED, {
                SPID_IDP_ID: nextAction.payload.id,
                SPID_IDP_NAME: nextAction.payload.name
              })
              .then(() => 0, () => 0);
          }
          break;

        //
        // Actions (without properties)
        //

        // authentication
        case ANALYTICS_AUTHENTICATION_STARTED:
        case LOGIN_SUCCESS:
        case LOGIN_FAILURE:
        case SESSION_INFO_LOAD_SUCCESS:
        case SESSION_INFO_LOAD_FAILURE:
        case SESSION_EXPIRED:
        case ANALYTICS_AUTHENTICATION_COMPLETED:
        case LOGOUT_SUCCESS:
        case LOGOUT_FAILURE:
        // onboarding
        case ANALYTICS_ONBOARDING_STARTED:
        case TOS_ACCEPT_SUCCESS:
        case PIN_CREATE_SUCCESS:
        case PIN_CREATE_FAILURE:
        // profile
        case PROFILE_LOAD_SUCCESS:
        case PROFILE_LOAD_FAILURE:
        case PROFILE_UPSERT_SUCCESS:
        case PROFILE_UPSERT_FAILURE:
        // messages
        case MESSAGES_LOAD_SUCCESS:
        case MESSAGES_LOAD_FAILURE:
        // other
        case NOTIFICATIONS_INSTALLATION_TOKEN_UPDATE:
        case NOTIFICATIONS_INSTALLATION_UPDATE_FAILURE:
          if (mixpanel !== undefined) {
            mixpanel.track(nextAction.type).then(() => 0, () => 0);
            if (nextAction.type === PROFILE_LOAD_SUCCESS) {
              // as soon as we have the user fiscal code, attach the mixpanel
              // session to the sha256 hash to the fiscal code of the user
              const fiscalnumber = nextAction.payload.fiscal_code;
              sha256(fiscalnumber).then(
                hash => {
                  if (mixpanel !== undefined) {
                    mixpanel.identify(hash).then(() => 0, () => 0);
                  }
                },
                () => 0
              );
            }
          }
          break;

        default: {
          break;
        }
      }

      return nextAction;
    };
  };
}

// gets the current screen from navigation state
// TODO: Need to be fixed
export function getCurrentRouteName(navNode: any): string | undefined {
  if (!navNode) {
    return undefined;
  }

  if (
    navNode.index === undefined &&
    navNode.routeName &&
    typeof navNode.routeName === "string"
  ) {
    // navNode is a NavigationLeafRoute
    return navNode.routeName;
  }

  if (
    navNode.routes &&
    navNode.index !== undefined &&
    navNode.routes[navNode.index]
  ) {
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

      if (nextScreen !== currentScreen && mixpanel) {
        mixpanel
          .track("SCREEN_CHANGE", {
            SCREEN_NAME: nextScreen
          })
          .then(() => 0, () => 0);
      }
      return result;
    };
  };
}
