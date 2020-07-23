import { Button, Text, View } from "native-base";
import * as React from "react";
import RNCalendarEvents, { Calendar } from "react-native-calendar-events";
import { connect } from "react-redux";

import * as pot from "italia-ts-commons/lib/pot";
import { EdgeBorderComponent } from "../components/screens/EdgeBorderComponent";
import ListItemComponent from "../components/screens/ListItemComponent";

import { ListRenderItemInfo, SectionList } from "react-native";
import I18n from "../i18n";
import { preferredCalendarSaveSuccess } from "../store/actions/persistedPreferences";
import { Dispatch } from "../store/actions/types";
import { GlobalState } from "../store/reducers/types";
import { convertLocalCalendarName } from "../utils/calendar";
import SectionHeaderComponent from "./screens/SectionHeaderComponent";
import customVariables from "../theme/variables";

type CalendarByAccount = Readonly<{
  title: string;
  data: ReadonlyArray<Calendar>;
}>;

type CalendarsByAccount = ReadonlyArray<CalendarByAccount>;

type OwnProps = {
  onCalendarSelected: (calendar: Calendar) => void;
  onCalendarsLoaded: (
    calendars: pot.Pot<ReadonlyArray<Calendar>, ResourceError>
  ) => void;
  lastListItem?: React.ReactNode;
  onCalendarRemove?: () => void;
};

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  OwnProps;

type State = {
  calendars: pot.Pot<ReadonlyArray<Calendar>, ResourceError>;
  calendarsByAccount: pot.Pot<CalendarsByAccount, ResourceError>;
};

const INITIAL_STATE: State = {
  calendars: pot.none,
  calendarsByAccount: pot.none
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
  const result: CalendarsByAccount = accounts.map(acc => ({
    title: acc,
    data: calendars.filter(cal => cal.source === acc)
  }));

  return result;
};

/**
 * Allows the user to select one of the device available Calendars
 */
class CalendarsListContainer extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  private renderSectionHeader = (info: { section: any }): React.ReactNode => (
    <SectionHeaderComponent sectionHeader={info.section.title} />
  );

  private renderListItem = ({ item }: ListRenderItemInfo<Calendar>) => {
    const { defaultCalendar } = this.props;
    const isDefaultCalendar = defaultCalendar && item.id === defaultCalendar.id;
    return (
      <ListItemComponent
        key={item.id}
        title={convertLocalCalendarName(item.title)}
        hideIcon={!isDefaultCalendar}
        iconSize={12}
        iconName={isDefaultCalendar ? "io-tick-big" : undefined}
        onPress={() =>
          isDefaultCalendar && this.props.onCalendarRemove
            ? this.props.onCalendarRemove()
            : this.props.onCalendarSelected(item)
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

  public render() {
    const { calendarsByAccount } = this.state;

    return (
      <React.Fragment>
        {pot.isError(calendarsByAccount) && (
          <React.Fragment>
            <Text>{mapResourceErrorToMessage(calendarsByAccount.error)}</Text>
            <Button onPress={this.fetchCalendars}>
              <Text>{I18n.t("global.buttons.retry")}</Text>
            </Button>
          </React.Fragment>
        )}
        <View style={{ paddingHorizontal: customVariables.contentPadding }}>
          {pot.isSome(calendarsByAccount) && (
            <SectionList
              sections={calendarsByAccount.value}
              renderSectionHeader={this.renderSectionHeader}
              renderItem={this.renderListItem}
            />
          )}
          <EdgeBorderComponent />
        </View>
      </React.Fragment>
    );
  }

  public componentDidMount() {
    this.fetchCalendars();
  }

  private fetchCalendars = () => {
    this.setState({
      calendars: pot.noneLoading,
      calendarsByAccount: pot.noneLoading
    });
    // Fetch user calendars.
    RNCalendarEvents.findCalendars()
      .then(calendars => {
        // Filter out only calendars that allow modifications
        const editableCalendars = pot.some(
          calendars.filter(calendar => calendar.allowsModifications)
        );

        const organizedCalendars = pot.some(
          getCalendarsByAccount(
            calendars.filter(calendar => calendar.allowsModifications)
          )
        );

        this.setState(
          {
            calendars: editableCalendars,
            calendarsByAccount: organizedCalendars
          },
          () => this.props.onCalendarsLoaded(editableCalendars)
        );
      })
      .catch(_ => {
        const fetchError: FetchError = {
          kind: "FETCH_ERROR"
        };
        const calendars: pot.Pot<
          ReadonlyArray<Calendar>,
          ResourceError
        > = pot.toError(pot.none, fetchError);
        const calendarsByAccount: pot.Pot<
          ReadonlyArray<CalendarByAccount>,
          ResourceError
        > = pot.toError(pot.none, fetchError);
        this.setState(
          {
            calendars,
            calendarsByAccount
          },
          () => this.props.onCalendarsLoaded(calendars)
        );
      });
  };
}

const mapStateToProps = (state: GlobalState) => ({
  defaultCalendar: state.persistedPreferences.preferredCalendar
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  preferredCalendarSaveSuccess: (calendar: Calendar) =>
    dispatch(
      preferredCalendarSaveSuccess({
        preferredCalendar: calendar
      })
    )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CalendarsListContainer);
