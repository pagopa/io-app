import { combineReducers } from "redux";

import { Action } from "../../../actions/types";
import calendarEventsByMessageIdReducer, {
  CalendarEventsByMessageIdState
} from "./calendarEventsByMessageId";

export type CalendarEventsState = {
  byMessageId: CalendarEventsByMessageIdState;
};

const reducer = combineReducers<CalendarEventsState, Action>({
  byMessageId: calendarEventsByMessageIdReducer
});

export default reducer;
