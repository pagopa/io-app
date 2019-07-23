/**
 * Entities reducer
 */
import { combineReducers } from "redux";

import { Action } from "../../actions/types";
import calendarEventsReducer, { CalendarEventsState } from "./calendarEvents";
import messagesReducer, { MessagesState } from "./messages";
import organizationsReducer, { OrganizationsState } from "./organizations";
import { paymentByRptIdReducer, PaymentByRptIdState } from "./payments";
import servicesReducer, { ServicesState } from "./services";

export type EntitiesState = Readonly<{
  messages: MessagesState;
  services: ServicesState;
  organizations: OrganizationsState;
  paymentByRptId: PaymentByRptIdState;
  calendarEvents: CalendarEventsState;
}>;

const reducer = combineReducers<EntitiesState, Action>({
  messages: messagesReducer,
  services: servicesReducer,
  organizations: organizationsReducer,
  paymentByRptId: paymentByRptIdReducer,
  calendarEvents: calendarEventsReducer
});

export default reducer;
