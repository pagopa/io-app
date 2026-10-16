import { applicationChangeState } from "../../../../actions/application";
import {
  addCalendarEvent,
  removeCalendarEvent
} from "../../../../actions/calendarEvents";
import reducer, {
  CalendarEvent,
  CalendarEventsByMessageIdState,
  INITIAL_STATE
} from "../calendarEventsByMessageId";

const eventA: CalendarEvent = { messageId: "message-a", eventId: "event-a" };
const eventB: CalendarEvent = { messageId: "message-b", eventId: "event-b" };

const stateWithBothEvents: CalendarEventsByMessageIdState = {
  [eventA.messageId]: eventA,
  [eventB.messageId]: eventB
};

describe("calendarEventsByMessageId reducer", () => {
  it("should return the initial state for an unrelated action", () => {
    expect(reducer(undefined, applicationChangeState("active"))).toEqual(
      INITIAL_STATE
    );
  });

  it("should index the event by its message id on addCalendarEvent", () => {
    const state = reducer(INITIAL_STATE, addCalendarEvent(eventA));
    expect(state).toEqual({ [eventA.messageId]: eventA });
  });

  test.each`
    name                                                          | initialState                      | messageId            | expected
    ${"remove the event and keep the remaining ones"}             | ${stateWithBothEvents}            | ${eventA.messageId}  | ${{ [eventB.messageId]: eventB }}
    ${"return an empty state when removing the only event"}       | ${{ [eventA.messageId]: eventA }} | ${eventA.messageId}  | ${{}}
    ${"leave the state unchanged when the message id is unknown"} | ${stateWithBothEvents}            | ${"missing-message"} | ${stateWithBothEvents}
    ${"return an empty state when removing from an empty state"}  | ${{}}                             | ${eventA.messageId}  | ${{}}
  `(
    "should $name on removeCalendarEvent",
    ({ initialState, messageId, expected }) => {
      expect(reducer(initialState, removeCalendarEvent({ messageId }))).toEqual(
        expected
      );
    }
  );

  it("should not mutate the previous state on removeCalendarEvent", () => {
    const initialState = { ...stateWithBothEvents };
    reducer(initialState, removeCalendarEvent({ messageId: eventA.messageId }));
    expect(initialState).toEqual(stateWithBothEvents);
  });
});
