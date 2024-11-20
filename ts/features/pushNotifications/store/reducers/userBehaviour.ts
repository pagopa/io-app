import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { setEngagementScreenShown } from "../actions/userBehaviour";

export type UserBehaviourState = {
  engagementScreenShown: boolean;
};

export const INITIAL_STATE: UserBehaviourState = {
  engagementScreenShown: false
};

export const userBehaviourReducer = (
  state: UserBehaviourState = INITIAL_STATE,
  action: Action
): UserBehaviourState => {
  switch (action.type) {
    case getType(setEngagementScreenShown):
      return { ...state, engagementScreenShown: true };
  }
  return state;
};
