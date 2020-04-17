import I18n from "../../i18n";
import { convertLocalCalendarName } from "../calendar";

describe("Convert calendar title to readable string", () => {
  const requestedCalendar: string = "calendar_displayname_local";
  const resultCalendarString = I18n.t(
    "profile.preferences.calendar.local_calendar"
  );
  it("Should return the converted and translated calendar name", () => {
    expect(convertLocalCalendarName(requestedCalendar)).toStrictEqual(
      resultCalendarString
    );
  });

  it("Should return the same string we pass", () => {
    const unknownCalendar = "Unknown Calendar";
    expect(convertLocalCalendarName(unknownCalendar)).toStrictEqual(
      unknownCalendar
    );
  });
});
