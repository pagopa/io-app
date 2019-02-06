import { getType } from "typesafe-actions";

import {
  addCalendarEvent,
  removeCalendarEvent
} from "../../../actions/calendarEvents";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";

export type CalendarEvent = {
  messageId: string;
  eventId: string;
};

export type CalendarEventsByMessageIdState = {
  [key: string]: CalendarEvent | undefined;
};

export const INITIAL_STATE: CalendarEventsByMessageIdState = {};

const reducer = (
  state: CalendarEventsByMessageIdState = INITIAL_STATE,
  action: Action
): CalendarEventsByMessageIdState => {
  switch (action.type) {
    case getType(addCalendarEvent): {
      const messageId = action.payload.messageId;

      return {
        ...state,
        [messageId]: action.payload
      };
    }

    case getType(removeCalendarEvent): {
      const messageId = action.payload.messageId;

      const stateCopy = { ...state };
      // tslint:disable-next-line:no-object-mutation
      delete stateCopy[messageId];
      return stateCopy;
    }

    default:
      return state;
  }
};

// Selectors
export const calendarEventByMessageIdSelector = (messageId: string) => (
  state: GlobalState
) => state.entities.calendarEvents.byMessageId[messageId];

export default reducer;
