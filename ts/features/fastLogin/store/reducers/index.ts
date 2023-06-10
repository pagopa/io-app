import { Action, getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { uniqWith, isEqual } from "lodash";
import { GlobalState } from "../../../../store/reducers/types";
import { askUserToRefreshSessionToken } from "../../../../store/actions/authentication";
import { clearPendingAction, savePendingAction } from "../../actions";

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
  pendingActions: Array<Action>;
};

export const fastLoginSelector = createSelector(
  (state: GlobalState) => state,
  state => state.features.loginFeatures.fastLogin
);

export const fastLoginPendingActionsSelector = createSelector(
  fastLoginSelector,
  fastLoginState => uniqWith(fastLoginState.pendingActions, isEqual)
);

const FastLoginInitialState: FastLoginState = {
  userInteractionNeeded: false,
  userInteractionLatestChoice: { type: "none" },
  pendingActions: []
};

export const fastLoginReducer = (
  state: FastLoginState = FastLoginInitialState,
  action: Action
): FastLoginState => {
  switch (action.type) {
    case getType(clearPendingAction):
      return {
        ...state,
        pendingActions: []
      };
    case getType(savePendingAction):
      const actionToSave = action as ReturnType<typeof savePendingAction>;
      return {
        ...state,
        pendingActions: [
          ...state.pendingActions,
          actionToSave.payload.pendingAction
        ]
      };
    case getType(askUserToRefreshSessionToken.request):
      return {
        ...state,
        userInteractionNeeded: true
      };
    case getType(askUserToRefreshSessionToken.success):
      const choiseAction = action as ReturnType<
        typeof askUserToRefreshSessionToken.success
      >;
      return {
        ...state,
        userInteractionLatestChoice: {
          type: choiseAction.payload === "yes" ? "accepted" : "declined",
          timestamp: Date.now()
        },
        userInteractionNeeded: false
      };
    default:
      return state;
  }
};
