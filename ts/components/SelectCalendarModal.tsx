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
 * A component to render a Calendar as FlatList item
 */
class CalendarItem extends React.PureComponent<CalendarItemProps> {
  public render() {
    return <Text onPress={this.onPress}>{this.props.calendar.title}</Text>;
  }

  private onPress = () => {
    const { calendar, onPress } = this.props;

    onPress(calendar);
  };
}

type Props = {
  onCancel: () => void;
  onCalendarSelected: (calendar: Calendar) => void;
  header?: React.ReactNode;
};

type State = {
  calendars: pot.Pot<ReadonlyArray<Calendar>, Error>;
};

const calendarKeyExtractor = (item: Calendar, _: number) => item.id;

/**
 * A modal that allow the user to select one of the device available Calendars
 */
// tslint:disable-next-line:max-classes-per-file
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
            {pot.isError(calendars) && <Text>{calendars.error.message}</Text>}
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
            <Button onPress={this.props.onCancel}>
              <Text>{I18n.t("global.buttons.cancel")}</Text>
            </Button>
          </Content>
        </Container>
      </Modal>
    );
  }

  public componentDidMount() {
    this.setState({ calendars: pot.toLoading(pot.none) });
    RNCalendarEvents.findCalendars()
      .then(calendars =>
        // Filter only the calendars that allow modifications
        calendars.filter(calendar => calendar.allowsModifications)
      )
      .then(calendars => this.setState({ calendars: pot.some(calendars) }))
      .catch(_ => {
        this.setState({
          calendars: pot.toError(
            pot.none,
            Error(I18n.t("messages.cta.errors.fetchCalendars"))
          )
        });
      });
  }

  private calendarRenderItem: ListRenderItem<Calendar> = info => {
    return (
      <CalendarItem
        calendar={info.item}
        onPress={this.props.onCalendarSelected}
      />
    );
  };
}

export default SelectCalendarModal;
