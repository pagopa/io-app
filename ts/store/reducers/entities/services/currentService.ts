import { NavigationActions } from "react-navigation";
import { createSelector } from "reselect";
import { Action } from "../../../actions/types";
import ROUTES from "../../../../navigation/routes";
import { GlobalState } from "../../types";
import { ServiceID } from "../../../../types/services/ServicePreference";

export type CurrentServiceSelectedState = {
  serviceID: ServiceID;
};

export const currentServiceSelectedReducer = (
  state: CurrentServiceSelectedState | null = null,
  action: Action
): CurrentServiceSelectedState | null => {
  switch (action.type) {
    case NavigationActions.NAVIGATE:
      if (action.routeName === ROUTES.SERVICE_DETAIL) {
        return action.params
          ? {
              serviceID: action.params.service.service_id
            }
          : null;
      }
  }

  return state;
};

/**
 * current serviceID selector
 */
export const euCovidCertCurrentSelector = createSelector(
  [(state: GlobalState) => state.entities.services.current],
  (serviceID): CurrentServiceSelectedState | null => serviceID
);
