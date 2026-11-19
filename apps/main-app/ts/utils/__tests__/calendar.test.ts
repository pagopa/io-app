import * as Calendar from "expo-calendar";
import I18n from "i18next";

import {
  convertLocalCalendarName,
  findDeviceCalendarsTask,
  saveEventToDeviceCalendarTask
} from "../calendar";

jest.mock("expo-calendar", () => ({
  EntityTypes: { EVENT: "event", REMINDER: "reminder" },
  createEventAsync: jest.fn(),
  getCalendarsAsync: jest.fn()
}));

describe("Convert calendar title to readable string", () => {
  const requestedCalendar = "calendar_displayname_local";
  const requestBadFormat = "caLeNdar_DisplaynAme_local ";
  const unknownCalendar = "Unknown Calendar";

  const resultCalendarString = I18n.t(
    "profile.preferences.calendar.local_calendar"
  );

  it("Should return the converted and translated calendar name", () => {
    expect(convertLocalCalendarName(requestedCalendar)).toStrictEqual(
      resultCalendarString
    );
  });

  it("Should return the converted and translated calendar name even if the key is written in a bad way", () => {
    expect(convertLocalCalendarName(requestBadFormat)).toStrictEqual(
      resultCalendarString
    );
  });

  it("Should return the same string we pass", () => {
    expect(convertLocalCalendarName(unknownCalendar)).toStrictEqual(
      unknownCalendar
    );
  });
});

describe("saveEventToDeviceCalendarTask", () => {
  const calendarId = "calendar-id";
  const title = "Promemoria per: Pagamento TARI";
  const dueDate = new Date("2026-10-20T00:00:00.000Z");

  beforeEach(() => {
    jest.mocked(Calendar.createEventAsync).mockResolvedValue("event-id");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // expo-calendar expects the calendar id as first argument, unlike the
  // former react-native-calendar-events which expected the event title
  it("should create the event in the selected calendar, passing the title in the event details", async () => {
    await saveEventToDeviceCalendarTask(calendarId, dueDate, title)();

    expect(Calendar.createEventAsync).toHaveBeenCalledTimes(1);
    expect(Calendar.createEventAsync).toHaveBeenCalledWith(calendarId, {
      title,
      startDate: dueDate.toISOString(),
      endDate: dueDate.toISOString(),
      allDay: true,
      alarms: []
    });
  });
});

describe("findDeviceCalendarsTask", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // On iOS, omitting the entity type also returns Reminders lists, which
  // cannot host events
  it("should request only the calendars that can host events", async () => {
    jest.mocked(Calendar.getCalendarsAsync).mockResolvedValue([]);

    await findDeviceCalendarsTask();

    expect(Calendar.getCalendarsAsync).toHaveBeenCalledWith(
      Calendar.EntityTypes.EVENT
    );
  });
});
