import * as pot from "italia-ts-commons/lib/pot";
import { Button, Container, Content, Text } from "native-base";
import React from "react";
import { FlatList, ListRenderItem, Modal } from "react-native";
import RNCalendarEvents, { Calendar } from "react-native-calendar-events";
import I18n from "../i18n";

type CalendarItemProps = {
  calendar: Calendar;
  onPress: (calendar: Calendar) => void;
};

/**
 * A function to render a Calendar as FlatList item
 */
const CalendarItem: React.SFC<CalendarItemProps> = props => {
  const handleOnPress = () => {
    const { calendar, onPress } = props;

    onPress(calendar);
  };

  return <Text onPress={handleOnPress}>{props.calendar.title}</Text>;
};

type Props = {
  onCancel: () => void;
  onCalendarSelected: (calendar: Calendar) => void;
  header?: React.ReactNode;
};

type State = {
  calendars: pot.Pot<ReadonlyArray<Calendar>, ResourceError>;
};

type FetchError = {
  kind: "FETCH_ERROR";
};

type ResourceError = FetchError;

const calendarKeyExtractor = (item: Calendar) => item.id;

const mapResourceErrorToMessage = (resourceError: ResourceError): string => {
  switch (resourceError.kind) {
    case "FETCH_ERROR":
      return I18n.t("messages.cta.errors.fetchCalendars");

    default: {
      // Exaustive check
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
      <Modal visible={true} onRequestClose={this.props.onCancel}>
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
                <FlatList
                  data={calendars.value}
                  keyExtractor={calendarKeyExtractor}
                  renderItem={this.calendarRenderItem}
                />
              </React.Fragment>
            )}
            <Button
              disabled={pot.isLoading(calendars)}
              onPress={this.props.onCancel}
            >
              <Text>{I18n.t("global.buttons.cancel")}</Text>
            </Button>
          </Content>
        </Container>
      </Modal>
    );
  }

  public componentDidMount() {
    this.fetchCalendars();
  }

  private calendarRenderItem: ListRenderItem<Calendar> = info => {
    return (
      <CalendarItem
        calendar={info.item}
        onPress={this.props.onCalendarSelected}
      />
    );
  };

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

export default SelectCalendarModal;
