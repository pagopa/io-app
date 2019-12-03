import { Button, List, Text } from "native-base";
import * as React from "react";
import {
  Platform,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity
} from "react-native";
import RNCalendarEvents, { Calendar } from "react-native-calendar-events";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import * as pot from "italia-ts-commons/lib/pot";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";

import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import { preferredCalendarSaveSuccess } from "../../store/actions/persistedPreferences";
import { Dispatch, ReduxProps } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";

const styles = StyleSheet.create({
  content: {
    padding: customVariables.contentPadding,
    paddingTop: 48
  },
  calendarItemWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: customVariables.brandLightGray,
    color: customVariables.contentPrimaryBackground
  },
  separator: {
    paddingTop: 25,
    width: "100%"
  }
});

const TouchableComponent =
  Platform.OS === "ios" ? TouchableHighlight : TouchableOpacity;

type CalendarItemProps = {
  calendar: Calendar;
  onPress: () => void;
};

type OwnProps = NavigationInjectedProps;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  ReduxProps &
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
class CalendarsPreferencesScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  private onCalendarSelected = (calendar: Calendar) => {
    this.props.preferredCalendarSaveSuccess(calendar);

    this.props.navigation.goBack();
  };

  public render() {
    const { calendars } = this.state;
    const { defaultCalendar } = this.props;

    return (
      <LoadingSpinnerOverlay isLoading={pot.isLoading(calendars)}>
        <TopScreenComponent
          headerTitle={I18n.t("profile.preferences.title")}
          title={I18n.t("profile.preferences.list.preferred_calendar.title")}
          goBack={this.props.navigation.goBack}
        >
          <ScreenContent
            title={I18n.t("profile.preferences.list.preferred_calendar.title")}
            subtitle={I18n.t("messages.cta.reminderCalendarSelect")}
          >
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
                {calendars.value.map(calendar => (
                  <ListItemComponent
                    key={calendar.id}
                    title={calendar.title}
                    hideIcon={
                      !(defaultCalendar && calendar.id === defaultCalendar.id)
                    }
                    iconNameSize={12}
                    iconName={
                      defaultCalendar && calendar.id === defaultCalendar.id
                        ? "io-plus"
                        : undefined
                    }
                    onPress={() => this.onCalendarSelected(calendar)}
                  />
                ))}
                <EdgeBorderComponent />
              </List>
            )}
          </ScreenContent>
        </TopScreenComponent>
      </LoadingSpinnerOverlay>
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
        const editableCalendars = calendars.filter(
          calendar => calendar.allowsModifications
        );
        this.setState({ calendars: pot.some(editableCalendars) });
      })
      .catch(_ => {
        const fetchError: FetchError = {
          kind: "FETCH_ERROR"
        };
        this.setState({
          calendars: pot.toError(pot.none, fetchError)
        });
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
)(CalendarsPreferencesScreen);
