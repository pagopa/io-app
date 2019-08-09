/**
 * Services reducer
 */
import { combineReducers } from "redux";

import { Action } from "../../../actions/types";
import readStateByServiceReducer, {
  ReadStateByServicesId
} from "./readStateByServiceId";

import servicesByIdReducer, { ServicesByIdState } from "./servicesById";
import {
  serviceIdsByOrganizationFiscalCodeReducer,
  ServiceIdsByOrganizationFiscalCodeState
} from "./servicesByOrganizationFiscalCode";

import { createSelector } from "reselect";
import { isDefined } from "../../../../utils/guards";
import { GlobalState } from "../../types";
import {
  organizationNamesByFiscalCodeSelector,
  OrganizationNamesByFiscalCodeState
} from "../organizations/organizationsByFiscalCodeReducer";
import {
  organizationsFiscalCodesSelectedStateSelector,
  OrganizationsSelectedState
} from "../organizations/organizationsFiscalCodesSelected";
import {
  visibleServicesReducer,
  VisibleServicesState
} from "./visibleServices";

export type ServicesState = Readonly<{
  byId: ServicesByIdState;
  byOrgFiscalCode: ServiceIdsByOrganizationFiscalCodeState;
  visible: VisibleServicesState;
  readState: ReadStateByServicesId;
}>;

const reducer = combineReducers<ServicesState, Action>({
  byId: servicesByIdReducer,
  byOrgFiscalCode: serviceIdsByOrganizationFiscalCodeReducer,
  visible: visibleServicesReducer,
  readState: readStateByServiceReducer
});

// Selectors
export const servicesSelector = (state: GlobalState) => state.entities.services;

const getLocalServices = (
  services: ServicesState,
  organizations: OrganizationNamesByFiscalCodeState,
  organizationsFiscalCodesSelected: OrganizationsSelectedState
) => {
  return organizationsFiscalCodesSelected
    .map(fiscalCode => {
      const organizationName = organizations[fiscalCode] || fiscalCode;
      const organizationFiscalCode = fiscalCode;
      const serviceIdsForOrg = services.byOrgFiscalCode[fiscalCode] || [];

      const data = serviceIdsForOrg
        .map(id => services.byId[id])
        .filter(isDefined);
      return {
        organizationName,
        organizationFiscalCode,
        data
      };
    })
    .filter(_ => _.data.length > 0)
    .sort((a, b) =>
      a.organizationName
        .toLocaleLowerCase()
        .localeCompare(b.organizationName.toLocaleLowerCase())
    );
};

export const localServicesSectionsSelector = createSelector(
  [
    servicesSelector,
    organizationNamesByFiscalCodeSelector,
    // TODO When https://github.com/teamdigitale/io-app/pull/1260 is merged
    // substitute with this selector "organizationsOfInterestSelector" from UserMetadata
    organizationsFiscalCodesSelectedStateSelector
  ],
  (services, organizations, organizationsSelected) =>
    getLocalServices(services, organizations, organizationsSelected)
);

export default reducer;
