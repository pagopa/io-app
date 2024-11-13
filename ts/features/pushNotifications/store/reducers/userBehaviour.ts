import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import {
  setEngagementScreenShown,
  setPushPermissionsRequestDuration
} from "../actions/userBehaviour";

export type UserBehaviourState = {
  engagementScreenShown: boolean;
  pushNotificationPermissionsRequestDuration?: number;
};

export const INITIAL_STATE: UserBehaviourState = {
  engagementScreenShown: false,
  pushNotificationPermissionsRequestDuration: undefined
};

export const userBehaviourReducer = (
  state: UserBehaviourState = INITIAL_STATE,
  action: Action
): UserBehaviourState => {
  switch (action.type) {
    case getType(setEngagementScreenShown):
      return { ...state, engagementScreenShown: true };
    case getType(setPushPermissionsRequestDuration):
      return {
        ...state,
        pushNotificationPermissionsRequestDuration: action.payload
      };
  }
  return state;
};
