/**
 * Redux actions related to calendar events.
 */

import { ActionType, createStandardAction } from "typesafe-actions";

export type AddCalendarEventPayload = {
  messageId: string;
  eventId: string;
};

export const addCalendarEvent = createStandardAction("CALENDAR_EVENT_ADD")<
  AddCalendarEventPayload
>();

export type RemoveCalendarEventPayload = {
  messageId: string;
};
export const removeCalendarEvent = createStandardAction(
  "CALENDAR_EVENT_REMOVE"
)<RemoveCalendarEventPayload>();

export type CalendarEventsActions = ActionType<
  typeof addCalendarEvent | typeof removeCalendarEvent
>;
