import * as pot from "@pagopa/ts-commons/lib/pot";
import React, { useCallback, useEffect, useState } from "react";

import { View, ListRenderItemInfo, SectionList } from "react-native";
import RNCalendarEvents, { Calendar } from "react-native-calendar-events";
import { ButtonSolid } from "@pagopa/io-app-design-system";
import _ from "lodash";
import ListItemComponent from "../components/screens/ListItemComponent";
import I18n from "../i18n";
import customVariables from "../theme/variables";
import { convertLocalCalendarName } from "../utils/calendar";
import { useIOSelector } from "../store/hooks";
import { preferredCalendarSelector } from "../store/reducers/persistedPreferences";
import { Body } from "./core/typography/Body";
import { EdgeBorderComponent } from "./screens/EdgeBorderComponent";
import SectionHeaderComponent from "./screens/SectionHeaderComponent";

type CalendarByAccount = Readonly<{
  title: string;
  data: ReadonlyArray<Calendar>;
}>;

type CalendarsByAccount = ReadonlyArray<CalendarByAccount>;

type OwnProps = {
  onCalendarSelected: (calendar: Calendar) => void;
  onCalendarsLoaded: () => void;
  lastListItem?: React.ReactNode;
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
const CalendarsListContainer = (props: OwnProps) => {
  const [calendarsByAccount, setCalendarsByAccount] = useState<
    pot.Pot<CalendarsByAccount, ResourceError>
  >(pot.none);
  const defaultCalendar = useIOSelector(preferredCalendarSelector, _.isEqual);

  const renderSectionHeader = (info: { section: any }): React.ReactNode => (
    <SectionHeaderComponent sectionHeader={info.section.title} />
  );

  const renderListItem = ({ item }: ListRenderItemInfo<Calendar>) => {
    const isDefaultCalendar = defaultCalendar && item.id === defaultCalendar.id;
    return (
      <ListItemComponent
        key={item.id}
        title={convertLocalCalendarName(item.title)}
        hideIcon={!isDefaultCalendar}
        iconSize={12}
        iconName={isDefaultCalendar ? "checkTickBig" : undefined}
        onPress={() =>
          isDefaultCalendar && props.onCalendarRemove
            ? props.onCalendarRemove()
            : props.onCalendarSelected(item)
        }
        accessible={true}
        accessibilityRole={"radio"}
        accessibilityLabel={`${convertLocalCalendarName(item.title)}, ${
          isDefaultCalendar
            ? I18n.t("global.accessibility.active")
            : I18n.t("global.accessibility.inactive")
        }`}
      />
    );
  };

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
        props.onCalendarsLoaded();
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
        props.onCalendarsLoaded();
      });
  }, [props]);

  useEffect(() => {
    fetchCalendars();
  }, [fetchCalendars]);

  return (
    <React.Fragment>
      {pot.isError(calendarsByAccount) && (
        <React.Fragment>
          <Body>{mapResourceErrorToMessage(calendarsByAccount.error)}</Body>
          <ButtonSolid
            onPress={fetchCalendars}
            label={I18n.t("global.buttons.retry")}
            accessibilityLabel={I18n.t("global.buttons.retry")}
          />
        </React.Fragment>
      )}
      <View style={{ paddingHorizontal: customVariables.contentPadding }}>
        {pot.isSome(calendarsByAccount) && (
          <SectionList
            extraData={{ defaultCalendar }}
            sections={calendarsByAccount.value}
            renderSectionHeader={renderSectionHeader}
            renderItem={renderListItem}
          />
        )}
        <EdgeBorderComponent />
      </View>
    </React.Fragment>
  );
};

export default CalendarsListContainer;
