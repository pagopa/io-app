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
