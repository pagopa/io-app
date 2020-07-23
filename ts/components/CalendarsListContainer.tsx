import { Button, List, Text } from "native-base";
import * as React from "react";
import RNCalendarEvents, { Calendar } from "react-native-calendar-events";
import { connect } from "react-redux";

import * as pot from "italia-ts-commons/lib/pot";
import { EdgeBorderComponent } from "../components/screens/EdgeBorderComponent";
import ListItemComponent from "../components/screens/ListItemComponent";

import I18n from "../i18n";
import { preferredCalendarSaveSuccess } from "../store/actions/persistedPreferences";
import { Dispatch } from "../store/actions/types";
import { GlobalState } from "../store/reducers/types";
import { convertLocalCalendarName } from "../utils/calendar";

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
};

const INITIAL_STATE: State = {
  calendars: pot.none
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

/**
 * Allows the user to select one of the device available Calendars
 */
class CalendarsListContainer extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  public render() {
    const { calendars } = this.state;
    const { defaultCalendar } = this.props;

    return (
      <React.Fragment>
        {pot.isError(calendars) && (
          <React.Fragment>
            <Text>{mapResourceErrorToMessage(calendars.error)}</Text>
            <Button onPress={this.fetchCalendars}>
              <Text>{I18n.t("global.buttons.retry")}</Text>
            </Button>
          </React.Fragment>
        )}
        {pot.isSome(calendars) && (
          <List withContentLateralPadding={true}>
            {calendars.value.map(calendar => {
              const isDefaultCalendar =
                defaultCalendar && calendar.id === defaultCalendar.id;
              return (
                <ListItemComponent
                  key={calendar.id}
                  title={convertLocalCalendarName(calendar.title)}
                  hideIcon={!isDefaultCalendar}
                  iconSize={12}
                  iconName={isDefaultCalendar ? "io-tick-big" : undefined}
                  onPress={() =>
                    isDefaultCalendar && this.props.onCalendarRemove
                      ? this.props.onCalendarRemove()
                      : this.props.onCalendarSelected(calendar)
                  }
                  accessible={true}
                  accessibilityRole={"radio"}
                  accessibilityLabel={`${convertLocalCalendarName(
                    calendar.title
                  )}, ${
                    isDefaultCalendar
                      ? I18n.t("global.accessibility.active")
                      : I18n.t("global.accessibility.inactive")
                  }`}
                />
              );
            })}
            {this.props.lastListItem}
            <EdgeBorderComponent />
          </List>
        )}
      </React.Fragment>
    );
  }

  public componentDidMount() {
    this.fetchCalendars();
  }

  private fetchCalendars = () => {
    this.setState({ calendars: pot.noneLoading });
    // Fetch user calendars.
    RNCalendarEvents.findCalendars()
      .then(calendars => {
        // Filter out only calendars that allow modifications
        const editableCalendars = pot.some(
          calendars.filter(calendar => calendar.allowsModifications)
        );
        this.setState({ calendars: editableCalendars }, () =>
          this.props.onCalendarsLoaded(editableCalendars)
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
        this.setState(
          {
            calendars
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
