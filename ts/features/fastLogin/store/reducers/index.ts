import { Action, getType } from "typesafe-actions";
import { GlobalState } from "../../../../store/reducers/types";
import { askUserToRefreshSessionToken } from "../../../../store/actions/authentication";

type FastLoginUserInteractionChoiceNone = {
  type: "none";
};
type FastLoginUserInteractionChoiceAccept = {
  type: "accepted";
  timestamp: number;
};
type FastLoginUserInteractionChoiceDecline = {
  type: "declined";
  timestamp: number;
};
export type FastLoginUserInteractionChoice =
  | FastLoginUserInteractionChoiceAccept
  | FastLoginUserInteractionChoiceDecline
  | FastLoginUserInteractionChoiceNone;

export type FastLoginState = {
  userInteractionNeeded: boolean;
  userInteractionLatestChoice: FastLoginUserInteractionChoice;
};

export const fastLoginSelector = (state: GlobalState): FastLoginState =>
  state.features.loginFeatures.fastLogin;

const FastLoginInitialState: FastLoginState = {
  userInteractionNeeded: false,
  userInteractionLatestChoice: { type: "none" }
};

export const fastLoginReducer = (
  state: FastLoginState = FastLoginInitialState,
  action: Action
): FastLoginState => {
  switch (action.type) {
    case getType(askUserToRefreshSessionToken.request):
      return {
        ...state,
        userInteractionNeeded: true
      };
    case getType(askUserToRefreshSessionToken.success):
      const typedAction = action as ReturnType<
        typeof askUserToRefreshSessionToken.success
      >;
      return {
        ...state,
        userInteractionLatestChoice: {
          type: typedAction.payload === "yes" ? "accepted" : "declined",
          timestamp: Date.now()
        },
        userInteractionNeeded: false
      };
    default:
      return state;
  }
};
