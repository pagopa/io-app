import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import {
  resetNotificationBannerDismissState,
  setPushNotificationBannerForceDismissed,
  setUserDismissedNotificationsBanner
} from "../actions/userBehaviour";

export type UserBehaviourState = {
  pushNotificationBannerDismissalCount: number;
  pushNotificationBannerForceDismissionDate?: number;
};

export const INITIAL_STATE: UserBehaviourState = {
  pushNotificationBannerDismissalCount: 0,
  pushNotificationBannerForceDismissionDate: undefined
};

export const userBehaviourReducer = (
  state: UserBehaviourState = INITIAL_STATE,
  action: Action
): UserBehaviourState => {
  switch (action.type) {
    case getType(setUserDismissedNotificationsBanner):
      return {
        ...state,
        pushNotificationBannerDismissalCount:
          state.pushNotificationBannerDismissalCount + 1
      };
    case getType(setPushNotificationBannerForceDismissed):
      return {
        ...state,
        pushNotificationBannerForceDismissionDate: new Date().getTime()
      };
    case getType(resetNotificationBannerDismissState):
      return {
        ...INITIAL_STATE
      };
  }
  return state;
};
