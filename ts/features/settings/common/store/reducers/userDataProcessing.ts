import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { UserDataProcessing } from "../../../../../../definitions/backend/UserDataProcessing";
import { UserDataProcessingChoiceEnum } from "../../../../../../definitions/backend/UserDataProcessingChoice";
import { Action } from "../../../../../store/actions/types";
import { computedProp } from "../../../../../types/utils";
import { clearCache } from "../actions";
import {
  deleteUserDataProcessing,
  loadUserDataProcessing,
  resetDeleteUserDataProcessing,
  resetUserDataProcessingRequest,
  upsertUserDataProcessing
} from "../actions/userDataProcessing";

export type UserDataProcessingState = {
  [key in keyof typeof UserDataProcessingChoiceEnum]: pot.Pot<
    undefined | UserDataProcessing,
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
    case getType(clearCache):
      return INITIAL_STATE;
    case getType(deleteUserDataProcessing.failure):
    // falls through
    case getType(loadUserDataProcessing.failure):
    case getType(upsertUserDataProcessing.failure):
      return {
        ...state,
        ...computedProp(
          action.payload.choice,
          pot.toError({ ...state[action.payload.choice] }, action.payload.error)
        )
      };
    case getType(deleteUserDataProcessing.request):
    // falls through
    case getType(upsertUserDataProcessing.request): {
      const maybeValue = state[action.payload];
      const prevValue = pot.isSome(maybeValue) ? maybeValue.value : undefined;

      return {
        ...state,
        ...computedProp(
          action.payload,
          pot.toUpdating(state[action.payload], prevValue)
        )
      };
    }
    case getType(loadUserDataProcessing.request): {
      return {
        ...state,
        ...computedProp(action.payload, pot.toLoading(state[action.payload]))
      };
    }
    case getType(loadUserDataProcessing.success): {
      return {
        ...state,
        ...computedProp(action.payload.choice, pot.some(action.payload.value))
      };
    }
    case getType(resetDeleteUserDataProcessing): {
      const maybeValue = state[UserDataProcessingChoiceEnum.DELETE];
      const prevValue = pot.isSome(maybeValue) ? maybeValue.value : undefined;

      return {
        ...state,
        [UserDataProcessingChoiceEnum.DELETE]: pot.some(prevValue)
      };
    }
    case getType(resetUserDataProcessingRequest): {
      return {
        ...state,
        ...computedProp(action.payload, pot.none)
      };
    }
    case getType(upsertUserDataProcessing.success): {
      return {
        ...state,
        ...computedProp(action.payload.choice, pot.some(action.payload))
      };
    }

    default:
      return state;
  }
};

export default userDataProcessingReducer;
