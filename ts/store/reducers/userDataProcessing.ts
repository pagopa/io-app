import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { UserDataProcessing } from "../../../definitions/backend/UserDataProcessing";
import { UserDataProcessingChoiceEnum } from "../../../definitions/backend/UserDataProcessingChoice";
import { clearCache } from "../actions/profile";
import { Action } from "../actions/types";
import {
  loadUserDataProcessing,
  resetUserDataProcessingRequest,
  upsertUserDataProcessing
} from "../actions/userDataProcessing";
import { GlobalState } from "./types";

export type UserDataProcessingState = {
  [key in keyof typeof UserDataProcessingChoiceEnum]: pot.Pot<
    UserDataProcessing,
    Error
  >;
};

// TODO: integrate with profile while it will be a profile attribute

export const INITIAL_STATE: UserDataProcessingState = {
  [UserDataProcessingChoiceEnum.DOWNLOAD]: pot.none,
  [UserDataProcessingChoiceEnum.DELETE]: pot.none
};

const userDataProcessingReducer = (
  state: UserDataProcessingState = INITIAL_STATE,
  action: Action
): UserDataProcessingState => {
  switch (action.type) {
    case getType(loadUserDataProcessing.request): {
      return {
        ...state,
        [action.payload]: pot.toLoading(pot.none)
      };
    }
    case getType(loadUserDataProcessing.success): {
      return {
        ...state,
        [action.payload.choice]: pot.some(action.payload.value)
      };
    }

    case getType(upsertUserDataProcessing.failure):
    case getType(loadUserDataProcessing.failure):
      return {
        ...state,
        [action.payload.choice]: pot.toError(
          { ...state[action.payload.choice] },
          action.payload.error
        )
      };

    case getType(upsertUserDataProcessing.request): {
      const maybeValue = state[action.payload];
      const prevValue = pot.isSome(maybeValue) ? maybeValue.value : undefined;
      return {
        ...state,
        [action.payload]: pot.toUpdating(state[action.payload], prevValue)
      };
    }
    case getType(upsertUserDataProcessing.success): {
      return {
        ...state,
        [action.payload.choice]: pot.some(action.payload)
      };
    }

    case getType(resetUserDataProcessingRequest): {
      return {
        ...state,
        [action.payload]: pot.none
      };
    }

    case getType(clearCache):
      return INITIAL_STATE;

    default:
      return state;
  }
};

export default userDataProcessingReducer;

// Selectors
export const userDataProcessingSelector = (state: GlobalState) =>
  state.userDataProcessing;
