import * as pot from "italia-ts-commons/lib/pot";
import { Button, Container, Content, Text, View } from "native-base";
import React from "react";
import {
  Platform,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity
} from "react-native";
import RNCalendarEvents, { Calendar } from "react-native-calendar-events";

import { connect } from "react-redux";
import { GlobalState } from "../store/reducers/types";

import IconFont from "../components/ui/IconFont";
import I18n from "../i18n";
import customVariables from "../theme/variables";
import FooterWithButtons from "./ui/FooterWithButtons";

const styles = StyleSheet.create({
  calendarItemWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: customVariables.brandLightGray,
    color: customVariables.contentPrimaryBackground
  },
  separator: {
    height: 10,
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

type Props = {
  onCancel: () => void;
  onCalendarSelected: (calendar: Calendar) => void;
  header?: React.ReactNode;
  defaultCalendar?: Calendar | undefined;
};

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
 * A modal that allow the user to select one of the device available Calendars
 */
class SelectCalendarModal extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      calendars: pot.none
    };
  }

  public render() {
    const { calendars } = this.state;

    return (
      <Container>
        <Content>
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
              {this.props.header || null}
              {calendars.value.map(calendar => (
                <CalendarItem
                  key={calendar.id}
                  calendar={calendar}
                  onPress={() => this.props.onCalendarSelected(calendar)}
                />
              ))}
              {this.props.defaultCalendar === undefined && (
                <View>
                  <View style={styles.separator} />
                  <Text>{I18n.t("messages.cta.helper")}</Text>
                </View>
              )}
            </React.Fragment>
          )}
        </Content>
        <FooterWithButtons
          type="SingleButton"
          leftButton={{
            disabled: pot.isLoading(calendars),
            bordered: true,
            onPress: this.props.onCancel,
            title: I18n.t("global.buttons.cancel"),
            block: true
          }}
        />
      </Container>
    );
  }

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
}

const mapStateToProps = (state: GlobalState) => ({
  defaultCalendar: state.persistedPreferences.preferredCalendar
});

export default connect(mapStateToProps)(SelectCalendarModal);
