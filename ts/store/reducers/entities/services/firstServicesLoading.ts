import { getType } from "typesafe-actions";
import { clearCache } from "../../../actions/profile";
import { FirstServiceLoadSuccess } from "../../../actions/services";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";

export type FirstLoadingState = Readonly<{
  isFirstServicesLoadingCompleted: boolean;
}>;

const INITIAL_STATE: FirstLoadingState = {
  isFirstServicesLoadingCompleted: false
};

// Reducer
export const firstLoadingReducer = (
  state: FirstLoadingState = INITIAL_STATE,
  action: Action
): FirstLoadingState => {
  switch (action.type) {
    case getType(FirstServiceLoadSuccess): {
      return {
        isFirstServicesLoadingCompleted: true
      };
    }

    case getType(clearCache): {
      return {
        isFirstServicesLoadingCompleted: false
      };
    }

    default:
      return state;
  }
};

// Selectors
export const isFirstVisibleServiceLoadCompletedSelector = (
  state: GlobalState
) => state.entities.services.firstLoading.isFirstServicesLoadingCompleted;
