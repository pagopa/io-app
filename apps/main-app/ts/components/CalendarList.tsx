import { ContentWrapper, RadioGroup, RadioItem } from "@io-app/design-system";
import * as Calendar from "expo-calendar";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { useIOSelector } from "../store/hooks";
import { preferredCalendarSelector } from "../store/reducers/persistedPreferences";
import { convertLocalCalendarName } from "../utils/calendar";

type CalendarListProps = {
  calendars: Array<Calendar.Calendar>;
  isLoading: boolean;
  onCalendarSelected: (calendar: Calendar.Calendar) => void;
};

const getCalendarsByAccount = (
  calendars: Array<Calendar.Calendar>
): Array<RadioItem<string>> =>
  calendars.reduce<Array<RadioItem<string>>>(
    (acc, calendar) =>
      calendar.allowsModifications
        ? [
            ...acc,
            {
              id: calendar.id,
              value: convertLocalCalendarName(calendar.title),
              description: calendar.source.name
            }
          ]
        : acc,
    []
  );

export const CalendarList = ({
  calendars = [],
  isLoading = false,
  onCalendarSelected
}: CalendarListProps) => {
  const preferredCalendar = useIOSelector(preferredCalendarSelector);

  const handleSelectCalendar = (calendarId: string) =>
    pipe(
      calendars,
      A.findFirst(calendar => calendar.id === calendarId),
      O.map(onCalendarSelected)
    );

  return (
    <ContentWrapper>
      <RadioGroup<string>
        items={isLoading ? loadingCalendars : getCalendarsByAccount(calendars)}
        onPress={handleSelectCalendar}
        selectedItem={preferredCalendar?.id}
        type="radioListItem"
      />
    </ContentWrapper>
  );
};

const loadingCalendars: Array<RadioItem<string>> = A.makeBy(5, index => ({
  id: index.toString(),
  disabled: true,
  loadingProps: { skeletonDescription: true, state: true },
  value: ""
}));
