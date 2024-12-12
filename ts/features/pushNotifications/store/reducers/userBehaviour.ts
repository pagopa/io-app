import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import {
  resetNotificationBannerDismissState,
  setEngagementScreenShown,
  setPushNotificationBannerForceDismissed,
  setUserDismissedNotificationsBanner
} from "../actions/userBehaviour";

export type UserBehaviourState = {
  engagementScreenShown: boolean;
  pushNotificationsBanner: {
    timesDismissed: number;
    forceDismissionDate?: number;
  };
};

const INITIAL_BANNER_STATE = {
  timesDismissed: 0,
  forceDismissionDate: undefined
};

export const INITIAL_STATE: UserBehaviourState = {
  engagementScreenShown: false,
  pushNotificationsBanner: {
    ...INITIAL_BANNER_STATE
  }
};

export const userBehaviourReducer = (
  state: UserBehaviourState = INITIAL_STATE,
  action: Action
): UserBehaviourState => {
  switch (action.type) {
    case getType(setEngagementScreenShown):
      return { ...state, engagementScreenShown: true };
    case getType(setUserDismissedNotificationsBanner):
      return {
        ...state,
        pushNotificationsBanner: {
          ...state.pushNotificationsBanner,
          timesDismissed: state.pushNotificationsBanner.timesDismissed + 1
        }
      };
    case getType(setPushNotificationBannerForceDismissed):
      return {
        ...state,
        pushNotificationsBanner: {
          ...state.pushNotificationsBanner,
          forceDismissionDate: new Date().getTime()
        }
      };
    case getType(resetNotificationBannerDismissState):
      return {
        ...state,
        pushNotificationsBanner: {
          ...INITIAL_BANNER_STATE
        }
      };
  }
  return state;
};
