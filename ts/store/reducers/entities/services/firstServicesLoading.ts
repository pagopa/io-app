import * as pot from "italia-ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";

import {
  firstServicesLoad,
  loadVisibleServices
} from "../../../actions/services";
import { Action } from "../../../actions/types";
import {
  userMetadataLoad,
  userMetadataUpsert
} from "../../../actions/userMetadata";
import { servicesMetadataByIdSelector } from "../../content";
import { GlobalState } from "../../types";
import { servicesByIdSelector } from "./servicesById";
import { visibleServicesSelector } from "./visibleServices";

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

    case getType(loadVisibleServices.failure): {
      if (pot.isNone(state.isFirstServicesLoadingCompleted)) {
        return {
          isFirstServicesLoadingCompleted: pot.toError(
            state.isFirstServicesLoadingCompleted,
            Error("Failed to load visibleServices")
          )
        };
      }
    }

    case getType(userMetadataLoad.failure): {
      if (pot.isNone(state.isFirstServicesLoadingCompleted)) {
        return {
          isFirstServicesLoadingCompleted: pot.toError(
            state.isFirstServicesLoadingCompleted,
            Error("Failed to load userMetadata")
          )
        };
      }
    }

    case getType(userMetadataUpsert.failure): {
      if (pot.isNone(state.isFirstServicesLoadingCompleted)) {
        return {
          isFirstServicesLoadingCompleted: pot.toError(
            state.isFirstServicesLoadingCompleted,
            Error("Failed to upsert userMetadata")
          )
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

export const isVisibleServicesContentLoadCompletedSelector = createSelector(
  [servicesByIdSelector, visibleServicesSelector],
  (servicesById, visibleServices) => {
    if (!pot.isSome(visibleServices)) {
      return false;
    }
    const servicesLoading = visibleServices.value.findIndex(service => {
      const serviceContent = servicesById[service.service_id];
      return serviceContent === undefined || pot.isLoading(serviceContent);
    });
    return servicesLoading === -1;
  }
);

export const isVisibleServicesMetadataLoadCompletedSelector = createSelector(
  [servicesMetadataByIdSelector, visibleServicesSelector],
  (servicesMetadataById, visibleServices) => {
    if (!pot.isSome(visibleServices)) {
      return false;
    }
    const servicesLoading = visibleServices.value.findIndex(service => {
      const serviceMetadata = servicesMetadataById[service.service_id];
      return serviceMetadata === undefined || pot.isLoading(serviceMetadata);
    });
    return servicesLoading === -1;
  }
);
