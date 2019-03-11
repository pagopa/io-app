import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { connect } from "react-redux";

import { NavigationInjectedProps } from "react-navigation";

import {
  Platform,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  View
} from "react-native";

import { Button, Text } from "native-base";

import I18n from "../../i18n";

import { ReduxProps } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";

import TopScreenComponent from "../../components/screens/TopScreenComponent";
import Markdown from "../../components/ui/Markdown";
import { preferredCalendarSaveSuccess } from "../../store/actions/persistedPreferences";

import RNCalendarEvents, { Calendar } from "react-native-calendar-events";
import customVariables from '../../theme/variables';
import IconFont from "../../components/ui/IconFont";                                                

type OwnProps = NavigationInjectedProps;

type Props = ReturnType<typeof mapStateToProps> &
  ReduxProps &
  OwnProps;

const styles = StyleSheet.create({
  calendarItemWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: customVariables.brandLightGray,
    color: customVariables.contentPrimaryBackground
  }
});

const TouchableComponent =
  Platform.OS === "ios" ? TouchableHighlight : TouchableOpacity;

type CalendarItemProps = {
  calendar: Calendar;
  onPress: ()=> void;
};

/**
 * Renders a Calendar as FlatList item
 */
const CalendarItem: React.SFC<CalendarItemProps> = props => (
  <TouchableComponent
    onPress={props.onPress}
    style={styles.calendarItemWrapper}
  >
    <Text link={true}>{props.calendar.title}</Text>
    <IconFont
      name="io-right"
      color={customVariables.contentPrimaryBackground}
    />
  </TouchableComponent>
);
  
  
type State = {
  calendars: pot.Pot<ReadonlyArray<Calendar>, ResourceError>;
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
 * Selects the default calendar to be used for event creation from messages CTAs
 */
class DefaultCalendarSelectScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      calendars: pot.none
    };
  }
  
  private goBack = () => this.props.navigation.goBack();

  public componentDidMount() {
    this.fetchCalendars();
  }

  private fetchCalendars = () => {
    this.setState({ calendars: pot.toLoading(pot.none) });
    // Fetch user calendars.
    // The needed permissions are already checked/asked by the MessageCTABar component.
    RNCalendarEvents.findCalendars()
      .then(calendars =>
        // Filter only the calendars that allow modifications
        calendars.filter(calendar => calendar.allowsModifications)
      )
      .then(calendars => this.setState({ calendars: pot.some(calendars) }))
      .catch(_ => {
        const fetchError: FetchError = {
          kind: "FETCH_ERROR"
        };
        this.setState({
          calendars: pot.toError(pot.none, fetchError)
        });
      });
  };

  private onCalendarSelected = (calendar:Calendar) => {
    this.props.dispatch(
      preferredCalendarSaveSuccess({
        preferredCalendar: calendar
      })
    );
  }

  public render() {

    const { calendars } = this.state;

    return (
      <TopScreenComponent
        title={I18n.t("preferred_calendar.title")}
        goBack={this.goBack}
        subtitle={I18n.t("preferred_calendar.subTitle")}
        contextualHelp={{
          title: I18n.t("preferred_calendar.title"),
          body: () => (
            <Markdown>{I18n.t("preferred_calendar.help")}</Markdown>
          )
        }}
      >
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 25
          }}
        >
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
        </View>
      </TopScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  preferredCalendar: state.persistedPreferences.preferredCalendar
});

export default connect(
  mapStateToProps,
)(DefaultCalendarSelectScreen);
