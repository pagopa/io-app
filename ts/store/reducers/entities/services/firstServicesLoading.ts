import { createSelector } from "reselect";
import { getType } from "typesafe-actions";

import { contentServiceLoad } from "../../../actions/content";
import { firstServicesLoad, loadService } from "../../../actions/services";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";
import { servicesByIdSelector } from "./servicesById";

// TODO into pr: evaluate how to manage if the service loading fails.
export enum LoadingResultEnum {
  "ISLOADING" = "ISLOADING",
  "SUCCESS" = "SUCCESS",
  "FAILED" = "FAILED"
}

export type FirstLoadingState = Readonly<{
  isFirstServicesLoadingCompleted: boolean;
  loadedServices: {
    [key: string]: {
      isContentSuccesfullyLoaded: LoadingResultEnum;
      isMetadataSuccesfullyLoaded: LoadingResultEnum;
    };
  };
}>;

const INITIAL_STATE: FirstLoadingState = {
  isFirstServicesLoadingCompleted: false,
  loadedServices: {}
};

// Reducer
export const firstLoadingReducer = (
  state: FirstLoadingState = INITIAL_STATE,
  action: Action
): FirstLoadingState => {
  switch (action.type) {
    case getType(loadService.request): {
      return {
        ...state,
        loadedServices: {
          ...state.loadedServices,
          [action.payload]: {
            ...state.loadedServices[action.payload],
            isContentSuccesfullyLoaded: LoadingResultEnum.ISLOADING
          }
        }
      };
    }

    case getType(loadService.success): {
      return {
        ...state,
        loadedServices: {
          ...state.loadedServices,
          [action.payload.service_id]: {
            ...state.loadedServices[action.payload.service_id],
            isContentSuccesfullyLoaded: LoadingResultEnum.SUCCESS
          }
        }
      };
    }

    case getType(loadService.failure): {
      return {
        ...state,
        loadedServices: {
          ...state.loadedServices,
          [action.payload]: {
            ...state.loadedServices[action.payload],
            isContentSuccesfullyLoaded: LoadingResultEnum.FAILED
          }
        }
      };
    }

    case getType(contentServiceLoad.request): {
      return {
        ...state,
        loadedServices: {
          ...state.loadedServices,
          [action.payload]: {
            ...state.loadedServices[action.payload],
            isMetadataSuccesfullyLoaded: LoadingResultEnum.ISLOADING
          }
        }
      };
    }

    case getType(contentServiceLoad.success): {
      return {
        ...state,
        loadedServices: {
          ...state.loadedServices,
          [action.payload.serviceId]: {
            ...state.loadedServices[action.payload.serviceId],
            isMetadataSuccesfullyLoaded: LoadingResultEnum.SUCCESS
          }
        }
      };
    }

    case getType(contentServiceLoad.failure): {
      return {
        ...state,
        loadedServices: {
          ...state.loadedServices,
          [action.payload]: {
            ...state.loadedServices[action.payload],
            isMetadataSuccesfullyLoaded: LoadingResultEnum.FAILED
          }
        }
      };
    }

    case getType(firstServicesLoad.success): {
      return {
        isFirstServicesLoadingCompleted: true,
        loadedServices: {}
      };
    }

    default:
      return state;
  }
};

// Selectors
export const isLoadCompletedSelector = (state: GlobalState) =>
  state.entities.services.firstLoading.isFirstServicesLoadingCompleted;
export const loadedServicesSelector = (state: GlobalState) =>
  state.entities.services.firstLoading.loadedServices;

export const isServiceLoadingCompletedSelector = createSelector(
  [isLoadCompletedSelector, loadedServicesSelector, servicesByIdSelector],
  (isFirstServiceLoadCompleted, loadedServices, servicesById) => {
    const areAllServicesLoaded =
      Object.keys(loadedServices).filter(
        serviceId =>
          loadedServices[serviceId].isMetadataSuccesfullyLoaded !==
          LoadingResultEnum.ISLOADING
      ).length === Object.keys(servicesById).length;

    return !isFirstServiceLoadCompleted && areAllServicesLoaded;
  }
);
