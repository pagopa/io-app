import * as pot from "italia-ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";

import { firstServicesLoad } from "../../../actions/services";
import { Action } from "../../../actions/types";
import { servicesMetadataByIdSelector } from "../../content";
import { GlobalState } from "../../types";
import { servicesByIdSelector } from "./servicesById";
import { visibleServicesSelector } from "./visibleServices";

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
    case getType(firstServicesLoad.success): {
      return {
        isFirstServicesLoadingCompleted: true
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

export const isVisibleServicesContentLoadCompletedSelector = createSelector(
  [servicesByIdSelector, visibleServicesSelector],
  (serviceById, visibleServices) => {
    const visibles = pot.isSome(visibleServices)
      ? visibleServices.value.length
      : 0;
    return (
      pot.isSome(visibleServices) &&
      Object.keys(serviceById).filter(serviceId => {
        const service = serviceById[serviceId];
        return service && (pot.isSome(service) || pot.isError(service));
      }).length === visibles
    );
  }
);

export const isVisibleServicesMetadataLoadCompletedSelector = createSelector(
  [servicesMetadataByIdSelector, visibleServicesSelector],
  (servicesMetadataById, visibleServices) => {
    const visibles = pot.isSome(visibleServices)
      ? visibleServices.value.length
      : 0;

    return (
      pot.isSome(visibleServices) &&
      Object.keys(servicesMetadataById).filter(serviceId => {
        const service = servicesMetadataById[serviceId];
        return service && (pot.isSome(service) || pot.isError(service));
      }).length === visibles
    );
  }
);
