/**
 * Entities reducer
 */
import { combineReducers } from "redux";

import { Action } from "../../actions/types";
import messagesReducer, { MessagesState } from "./messages";
import {
  OrganizationNamesByFiscalCodeState,
  servicesByOrganizationFiscalCodeReducer
} from "./organizations/organizationsByFiscalCodeReducer";
import servicesReducer, { ServicesState } from "./services";

export type EntitiesState = Readonly<{
  messages: MessagesState;
  services: ServicesState;
  organizations: OrganizationNamesByFiscalCodeState;
}>;

const reducer = combineReducers<EntitiesState, Action>({
  messages: messagesReducer,
  services: servicesReducer,
  organizations: servicesByOrganizationFiscalCodeReducer
});

export default reducer;
