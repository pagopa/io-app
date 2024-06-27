import * as pot from "@pagopa/ts-commons/lib/pot";
import React, { memo, useCallback, useEffect, useState } from "react";
import RNCalendarEvents, { Calendar } from "react-native-calendar-events";
import {
  ButtonSolid,
  ContentWrapper,
  ListItemHeader,
  RadioGroup,
  VSpacer
} from "@pagopa/io-app-design-system";
import _ from "lodash";
import I18n from "../i18n";
import { useIOSelector } from "../store/hooks";
import { preferredCalendarSelector } from "../store/reducers/persistedPreferences";
import { Body } from "./core/typography/Body";

type CalendarByAccount = Readonly<{
  title: string;
  data: ReadonlyArray<Calendar>;
}>;

type CalendarsByAccount = ReadonlyArray<CalendarByAccount>;

type Props = {
  onCalendarSelected: (calendar: Calendar) => void;
  onCalendarsLoaded: () => void;
  onCalendarRemove?: () => void;
};

type FetchError = {
  kind: "FETCH_ERROR";
};

type ResourceError = FetchError;

const mapResourceErrorToMessage = (resourceError: ResourceError): string => {
  switch (resourceError.kind) {
    case "FETCH_ERROR":
      return I18n.t("messages.cta.errors.fetchCalendars");

    default: {
      // Exhaustive check
      return ((): never => resourceError.kind)();
    }
  }
};

const getCalendarsByAccount = (calendars: ReadonlyArray<Calendar>) => {
  const accounts: ReadonlyArray<string> = [
    ...new Set(calendars.map(cal => cal.source))
  ];

  return accounts.map(acc => ({
    title: acc,
    data: calendars.filter(cal => cal.source === acc)
  }));
};

/**
 * Allows the user to select one of the device available Calendars
 */
const CalendarsListContainer = (props: Props) => {
  const { onCalendarSelected, onCalendarsLoaded, onCalendarRemove } = props;
  const [calendarsByAccount, setCalendarsByAccount] = useState<
    pot.Pot<CalendarsByAccount, ResourceError>
  >(pot.none);
  const defaultCalendar = useIOSelector(preferredCalendarSelector, _.isEqual);
  const [selectedCalendar, setSelectedCalendar] = useState<
    Calendar | undefined
  >(defaultCalendar);

  const fetchCalendars = useCallback(() => {
    setCalendarsByAccount(pot.noneLoading);
    // Fetch user calendars.
    RNCalendarEvents.findCalendars()
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
      .catch(_ => {
        const fetchError: FetchError = {
          kind: "FETCH_ERROR"
        };
        const calendarsByAccount: pot.Pot<
          ReadonlyArray<CalendarByAccount>,
          ResourceError
        > = pot.toError(pot.none, fetchError);
        setCalendarsByAccount(calendarsByAccount);
        onCalendarsLoaded();
      });
  }, [onCalendarsLoaded]);

  const mapData = useCallback(
    (data: ReadonlyArray<Calendar>) =>
      data.map((item: Calendar) => ({
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
      if (calendar) {
        const isDefaultCalendar =
          defaultCalendar && calendar.id === defaultCalendar.id;
        setSelectedCalendar(calendar);
        if (isDefaultCalendar && onCalendarRemove) {
          onCalendarRemove();
        } else {
          onCalendarSelected(calendar);
        }
      }
    },
    [calendarsByAccount, defaultCalendar, onCalendarRemove, onCalendarSelected]
  );

  useEffect(() => {
    fetchCalendars();
  }, [fetchCalendars]);

  return (
    <ContentWrapper>
      {pot.isError(calendarsByAccount) && (
        <>
          <Body>{mapResourceErrorToMessage(calendarsByAccount.error)}</Body>
          <ButtonSolid
            onPress={fetchCalendars}
            label={I18n.t("global.buttons.retry")}
            accessibilityLabel={I18n.t("global.buttons.retry")}
          />
        </>
      )}

      {pot.isSome(calendarsByAccount) && (
        <>
          {calendarsByAccount.value.map((section, index) => (
            <React.Fragment key={index}>
              <ListItemHeader label={section.title} />
              <RadioGroup<string>
                type="radioListItem"
                key={`radio_group_${index}`}
                items={mapData(section.data)}
                selectedItem={selectedCalendar?.id}
                onPress={onPressRadio}
              />
              {/* not show the end spacer if the element is the last */}
              {index < calendarsByAccount.value.length - 1 && (
                <VSpacer size={24} />
              )}
            </React.Fragment>
          ))}
        </>
      )}
    </ContentWrapper>
  );
};

export default memo(CalendarsListContainer);
