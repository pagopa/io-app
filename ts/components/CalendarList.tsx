import { Calendar } from "react-native-calendar-events";
import {
  ContentWrapper,
  RadioGroup,
  RadioItem
} from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { convertLocalCalendarName } from "../utils/calendar";
import { useIOSelector } from "../store/hooks";
import { preferredCalendarSelector } from "../store/reducers/persistedPreferences";

type CalendarListProps = {
  calendars: Array<Calendar>;
  isLoading: boolean;
  onCalendarSelected: (calendar: Calendar) => void;
};

const getCalendarsByAccount = (
  calendars: Array<Calendar>
): Array<RadioItem<string>> =>
  pipe(
    calendars,
    A.filter(calendar => calendar.allowsModifications),
    A.map(calendar => ({
      id: calendar.id,
      value: convertLocalCalendarName(calendar.title),
      description: calendar.source
    }))
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
