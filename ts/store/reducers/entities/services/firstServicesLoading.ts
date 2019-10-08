import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import {
  firstServicesLoad,
  loadVisibleServices
} from "../../../actions/services";
import { Action } from "../../../actions/types";
import { userMetadataLoad } from "../../../actions/userMetadata";
import { GlobalState } from "../../types";

export type FirstLoadingState = Readonly<{
  isFirstServicesLoadingCompleted: pot.Pot<boolean, Error>;
}>;

const INITIAL_STATE: FirstLoadingState = {
  isFirstServicesLoadingCompleted: pot.none
};

// Reducer
export const firstLoadingReducer = (
  state: FirstLoadingState = INITIAL_STATE,
  action: Action
): FirstLoadingState => {
  switch (action.type) {
    case getType(firstServicesLoad.request): {
      return {
        isFirstServicesLoadingCompleted: pot.toLoading(
          state.isFirstServicesLoadingCompleted
        )
      };
    }

    case getType(firstServicesLoad.success): {
      return {
        isFirstServicesLoadingCompleted: pot.some(true)
      };
    }

    case getType(firstServicesLoad.failure): {
      return {
        isFirstServicesLoadingCompleted: pot.toError(
          state.isFirstServicesLoadingCompleted,
          action.payload
        )
      };
    }

    case getType(loadVisibleServices.request):
    case getType(userMetadataLoad.request): {
      if (pot.isError(state.isFirstServicesLoadingCompleted)) {
        return {
          isFirstServicesLoadingCompleted: pot.toLoading(
            state.isFirstServicesLoadingCompleted
          )
        };
      } else {
        return {
          ...state
        };
      }
    }

    case getType(loadVisibleServices.failure):
      if (pot.isNone(state.isFirstServicesLoadingCompleted)) {
        return {
          isFirstServicesLoadingCompleted: pot.toError(
            state.isFirstServicesLoadingCompleted,
            Error("Failed to load visibleServices")
          )
        };
      } else {
        return {
          ...state
        };
      }

    case getType(userMetadataLoad.failure): {
      if (pot.isNone(state.isFirstServicesLoadingCompleted)) {
        return {
          isFirstServicesLoadingCompleted: pot.toError(
            state.isFirstServicesLoadingCompleted,
            Error("Failed to load userMetadata")
          )
        };
      } else {
        return {
          ...state
        };
      }
    }

    default:
      return state;
  }
};

// Selectors
export const isFirstVisibleServiceLoadCompletedSelector = (
  state: GlobalState
): pot.Pot<boolean, Error> =>
  state.entities.services.firstLoading.isFirstServicesLoadingCompleted;
