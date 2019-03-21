import * as React from "react";
import { connect } from "react-redux";

import { NavigationInjectedProps } from "react-navigation";

import * as pot from "italia-ts-commons/lib/pot";
import { Button, Text } from "native-base";
import {
  Platform,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  View
} from "react-native";
import RNCalendarEvents, { Calendar } from "react-native-calendar-events";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import { Dispatch, ReduxProps } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";

import TopScreenComponent from "../../components/screens/TopScreenComponent";
import { preferredCalendarSaveSuccess } from "../../store/actions/persistedPreferences";
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

/**
 * Renders a Calendar as FlatList item
 */
const CalendarItem: React.SFC<CalendarItemProps> = props => (
  <TouchableComponent onPress={props.onPress}>
    <View style={styles.calendarItemWrapper}>
      <Text link={true}>{props.calendar.title}</Text>
      <IconFont
        name="io-right"
        color={customVariables.contentPrimaryBackground}
      />
    </View>
  </TouchableComponent>
);

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

    return (
      <TopScreenComponent
        headerTitle={I18n.t("preferences.title")}
        title={I18n.t("preferences.list.preferred_calendar.title")}
        goBack={this.props.navigation.goBack}
        subtitle={I18n.t("messages.cta.reminderCalendarSelect")}
      >
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 25
          }}
        />
        <View style={styles.content}>
          {pot.isLoading(calendars) && <Text>Loading calendars...</Text>}
          {pot.isError(calendars) && (
            <React.Fragment>
              <Text>{mapResourceErrorToMessage(calendars.error)}</Text>
              <Button onPress={this.fetchCalendars}>
                <Text>{I18n.t("global.buttons.retry")}</Text>
              </Button>
            </React.Fragment>
          )}
          {pot.isSome(calendars) && (
            <React.Fragment>
              {calendars.value.map(calendar => (
                <CalendarItem
                  key={calendar.id}
                  calendar={calendar}
                  onPress={() => this.onCalendarSelected(calendar)}
                />
              ))}
            </React.Fragment>
          )}
          <Text style={styles.separator}>{I18n.t("messages.cta.helper")}</Text>
        </View>
      </TopScreenComponent>
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
