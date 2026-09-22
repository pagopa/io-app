import {
  ListItemHeader,
  RadioGroup,
  useIOToast,
  VSpacer
} from "@io-app/design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as Calendar from "expo-calendar";
import I18n from "i18next";
import _ from "lodash";
import { Fragment, memo, useCallback, useEffect, useState } from "react";

import { useIOSelector } from "../store/hooks";
import { preferredCalendarSelector } from "../store/reducers/persistedPreferences";

type CalendarByAccount = Readonly<{
  data: ReadonlyArray<Calendar.Calendar>;
  title: string;
}>;

type CalendarsByAccount = ReadonlyArray<CalendarByAccount>;

type FetchError = {
  kind: "FETCH_ERROR";
};

type Props = {
  onCalendarRemove?: () => void;
  onCalendarSelected: (calendar: Calendar.Calendar) => void;
  onCalendarsLoaded: () => void;
};

type ResourceError = FetchError;

const getCalendarsByAccount = (calendars: ReadonlyArray<Calendar.Calendar>) => {
  const accounts: ReadonlyArray<string> = [
    ...new Set(calendars.map(cal => cal.source.name))
  ];

  return accounts.map(acc => ({
    title: acc,
    data: calendars.filter(cal => cal.source.name === acc)
  }));
};

/**
 * Allows the user to select one of the device available Calendars
 */
const CalendarsListContainer = ({
  onCalendarSelected,
  onCalendarsLoaded,
  onCalendarRemove
}: Props) => {
  const [calendarsByAccount, setCalendarsByAccount] = useState<
    pot.Pot<CalendarsByAccount, ResourceError>
  >(pot.none);
  const toast = useIOToast();
  const defaultCalendar = useIOSelector(preferredCalendarSelector, _.isEqual);
  const [selectedCalendar, setSelectedCalendar] = useState<
    Calendar.Calendar | undefined
  >(defaultCalendar);

  const fetchCalendars = useCallback(async () => {
    setCalendarsByAccount(pot.noneLoading);
    // Fetch user calendars.
    Calendar.getCalendarsAsync("event")
      .then(calendars => {
        // Filter out only calendars that allow modifications
        const organizedCalendars = pot.some(
          getCalendarsByAccount(
            calendars.filter(calendar => calendar.allowsModifications)
          )
        );
        setCalendarsByAccount(organizedCalendars);
        onCalendarsLoaded();
      })
      .catch(__ => {
        const fetchError: FetchError = {
          kind: "FETCH_ERROR"
        };
        const calendars: pot.Pot<
          ReadonlyArray<CalendarByAccount>,
          ResourceError
        > = pot.toError(pot.none, fetchError);
        setCalendarsByAccount(calendars);
        onCalendarsLoaded();
      });
  }, [onCalendarsLoaded]);

  const mapData = useCallback(
    (data: ReadonlyArray<Calendar.Calendar>) =>
      data.map((item: Calendar.Calendar) => ({
        id: item.id,
        value: item.title,
        disabled: !item.allowsModifications
      })),
    []
  );

  const onPressRadio = useCallback(
    (value: string) => {
      const calendar =
        pot.isSome(calendarsByAccount) &&
        calendarsByAccount.value
          .flatMap(section => section.data)
          .find(cal => cal.id === value);
      if (calendar !== undefined && calendar !== false) {
        const isDefaultCalendar =
          defaultCalendar && calendar.id === defaultCalendar.id;
        if (isDefaultCalendar && onCalendarRemove) {
          onCalendarRemove();
          setSelectedCalendar(undefined);
        } else {
          setSelectedCalendar(calendar);
          onCalendarSelected(calendar);
        }
        toast.hideAll();
        toast.success(I18n.t("profile.preferences.genericToastTitle"));
      }
    },
    [
      calendarsByAccount,
      defaultCalendar,
      onCalendarRemove,
      onCalendarSelected,
      toast
    ]
  );

  useEffect(() => {
    void fetchCalendars();
  }, [fetchCalendars]);

  return (
    pot.isSome(calendarsByAccount) &&
    calendarsByAccount.value.map((section, index) => (
      <Fragment key={index}>
        <ListItemHeader label={section.title} />
        <RadioGroup<string>
          items={mapData(section.data)}
          key={`radio_group_${index}`}
          onPress={onPressRadio}
          selectedItem={selectedCalendar?.id}
          type="radioListItem"
        />
        {/* not show the end spacer if the element is the last */}
        {index < calendarsByAccount.value.length - 1 && <VSpacer size={24} />}
      </Fragment>
    ))
  );
};

export default memo(CalendarsListContainer);
