/**
 * Entities reducer
 */
import { combineReducers } from "redux";

import { Action } from "../../actions/types";
import calendarEventsReducer, { CalendarEventsState } from "./calendarEvents";
import messagesReducer, { MessagesState } from "./messages";
import {
  OrganizationNamesByFiscalCodeState,
  servicesByOrganizationFiscalCodeReducer
} from "./organizations/organizationsByFiscalCodeReducer";
import { paymentByRptIdReducer, PaymentByRptIdState } from "./payments";
import {
  ReadTransactionsState,
  transactionsReadReducer
} from "./readTransactions";
import servicesReducer, { ServicesState } from "./services";

export type EntitiesState = Readonly<{
  messages: MessagesState;
  services: ServicesState;
  organizations: OrganizationNamesByFiscalCodeState;
  paymentByRptId: PaymentByRptIdState;
  calendarEvents: CalendarEventsState;
  transactionsRead: ReadTransactionsState;
}>;

const reducer = combineReducers<EntitiesState, Action>({
  messages: messagesReducer,
  services: servicesReducer,
  organizations: servicesByOrganizationFiscalCodeReducer,
  paymentByRptId: paymentByRptIdReducer,
  calendarEvents: calendarEventsReducer,
  transactionsRead: transactionsReadReducer
});

export default reducer;
