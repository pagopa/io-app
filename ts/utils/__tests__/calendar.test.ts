import I18n from "i18next";
import { convertLocalCalendarName } from "../calendar";

describe("Convert calendar title to readable string", () => {
  const requestedCalendar: string = "calendar_displayname_local";
  const requestBadFormat: string = "caLeNdar_DisplaynAme_local ";
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
