import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { UserDataProcessing } from "../../../definitions/backend/UserDataProcessing";
import { UserDataProcessingChoiceEnum } from "../../../definitions/backend/UserDataProcessingChoice";
import { clearCache } from "../actions/profile";
import { Action } from "../actions/types";
import {
  loadUserDataProcessing,
  upsertUserDataProcessing
} from "../actions/userDataProcessing";
import { GlobalState } from "./types";

// TODO: integrate with profile while it will be a profile attribute
export type UserDataProcessingState = {
  [UserDataProcessingChoiceEnum.DOWNLOAD]: pot.Pot<UserDataProcessing, Error>;
  [UserDataProcessingChoiceEnum.DELETE]: pot.Pot<UserDataProcessing, Error>;
};

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
        [action.payload]: pot.toLoading(state[action.payload])
      };
    }
    case getType(loadUserDataProcessing.success): {
      return {
        ...state,
        [action.payload.choice]: action.payload.value
          ? pot.some(action.payload.value)
          : pot.none
      };
    }

    case getType(upsertUserDataProcessing.failure):
    case getType(loadUserDataProcessing.failure):
      return {
        ...state,
        [action.payload.choice]: pot.toError(
          state[action.payload.choice],
          action.payload.error
        )
      };

    case getType(upsertUserDataProcessing.request): {
      return {
        ...state,
        [action.payload.choice]: pot.toUpdating(
          state[action.payload.choice],
          action.payload
        )
      };
    }
    case getType(upsertUserDataProcessing.success): {
      return {
        ...state,
        [action.payload.choice]: pot.some(action.payload)
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
export const userDataDeletionProcessingSelector = (state: GlobalState) =>
  state.userDataProcessing[UserDataProcessingChoiceEnum.DELETE];

export const userDataDownloadingProcessingSelector = (state: GlobalState) =>
  state.userDataProcessing[UserDataProcessingChoiceEnum.DOWNLOAD];
