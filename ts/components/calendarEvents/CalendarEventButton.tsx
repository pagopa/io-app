import { Either, left, right } from "fp-ts/lib/Either";
import { none, Option, some } from "fp-ts/lib/Option";
import { Button, H1, Text } from "native-base";
import React from "react";
import { Alert, StyleSheet } from "react-native";
import ReactNativeCalendarEvents, {
  Calendar,
  CalendarEventWritable,
  Options
} from "react-native-calendar-events";

import I18n from "../../i18n";
import { checkAndRequestPermission } from "../../utils/calendar";
import { withLightModalContext } from "../helpers/withLightModalContext";
import SelectCalendarModal from "../SelectCalendarModal";
import { LightModalContextInterface } from "../ui/LightModal";
import LoadingButton from "../ui/LoadingButton";

export type CalendarEventData = {
  title: string;
  details: CalendarEventWritable;
  options?: Options;
};

export type OnCalendarEventAddedData = {
  eventId: string;
  title: string;
  calendar: Calendar;
};

type OwnProps = {
  maybeCalendarEventId: Option<string>;
  onCalendarEventDataRequested: () => CalendarEventData | undefined;
  onCalendarEventAdded: (result: Either<Error, string>) => void;
  onCalendarEventRemoved: (result: Either<Error, boolean>) => void;
};

type Props = OwnProps & LightModalContextInterface;

type State = {
  maybeIsEventInCalendar: Option<boolean>;
};

const styles = StyleSheet.create({
  buttonStyle: {
    flex: 1
  },

  selectCalendaModalHeader: {
    marginBottom: 25
  }
});

const SelectCalendarModalHeader = (
  <H1 style={styles.selectCalendaModalHeader}>
    {I18n.t("calendarEvents.calendarSelect")}
  </H1>
);

export async function withCheckAndRequestPermission(): Promise<void> {
  return new Promise((resolve, reject) => {
    checkAndRequestPermission()
      .then(hasPermission => {
        hasPermission ? resolve() : reject();
      })
      .catch(_ => reject(_));
  });
}

/**
 * Allow to add/remove a calendar event.
 */
class CalendarEventButton extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      maybeIsEventInCalendar: none
    };
  }

  private onSelectCalendarCancel = () => {
    this.props.hideModal();
  };

  private onSelectCalendarSuccess = (calendar: Calendar) => {
    this.props.hideModal();
    const calendarEventData = this.props.onCalendarEventDataRequested();

    if (calendarEventData !== undefined) {
      this.addEventToCalendar({
        ...calendarEventData,
        details: {
          ...calendarEventData.details,
          calendarId: calendar.id
        }
      });
    }
  };

  /**
   * Check if the eventId of the CalendarEvent stored in redux is really/still
   * in the device calendar.
   * It is important to make this check because the event can be removed outside
   * the App.
   */
  private checkIfEventInCalendar = (calendarEventId: string) => {
    checkAndRequestPermission()
      .then(hasPermission => {
        if (hasPermission) {
          ReactNativeCalendarEvents.findEventById(calendarEventId)
            .then(event => {
              if (event) {
                // The event is in the store and also in the device calendar
                // Update the state to display and handle the reminder button correctly
                this.setState({
                  maybeIsEventInCalendar: some(true)
                });
              } else {
                this.setState({
                  maybeIsEventInCalendar: some(false)
                });
              }
            })
            .catch();
        }
      })
      .catch();
  };

  private addEvent = () => {
    const { onCalendarEventDataRequested, showModal } = this.props;
    const calendarEventData = onCalendarEventDataRequested();

    if (calendarEventData !== undefined) {
      if (calendarEventData.details.calendarId !== undefined) {
        this.addEventToCalendar(calendarEventData);
      } else {
        withCheckAndRequestPermission()
          .then(() =>
            showModal(
              <SelectCalendarModal
                onCancel={this.onSelectCalendarCancel}
                onCalendarSelected={this.onSelectCalendarSuccess}
                header={SelectCalendarModalHeader}
              />
            )
          )
          .catch(() => this.props.onCalendarEventAdded(left(Error())));
      }
    }
  };

  private addEventToCalendar = (calendarEventData: CalendarEventData) => {
    withCheckAndRequestPermission()
      .then(() =>
        ReactNativeCalendarEvents.saveEvent(
          calendarEventData.title,
          calendarEventData.details,
          calendarEventData.options
        )
          .then(_ => this.props.onCalendarEventAdded(right(_)))
          .catch(_ => this.props.onCalendarEventAdded(left(_)))
      )
      .catch(_ => this.props.onCalendarEventAdded(left(_)));
  };

  private removeEventFromCalendar = (calendarEventId: string) => {
    withCheckAndRequestPermission()
      .then(() =>
        Alert.alert(
          I18n.t("calendarEvents.removeRequest.title"),
          undefined,
          [
            {
              text: I18n.t("calendarEvents.removeRequest.cancel"),
              style: "cancel"
            },
            {
              text: I18n.t("calendarEvents.removeRequest.ok"),
              style: "destructive",
              onPress: () => {
                // After confirmation remove it
                ReactNativeCalendarEvents.removeEvent(calendarEventId)
                  .then(_ => {
                    this.props.onCalendarEventRemoved(right(_));
                  })
                  .catch(_ => this.props.onCalendarEventRemoved(left(_)));
              }
            }
          ],
          { cancelable: false }
        )
      )
      .catch(_ => this.props.onCalendarEventRemoved(left(_)));
  };

  public render() {
    const { maybeCalendarEventId } = this.props;

    if (maybeCalendarEventId.isSome()) {
      const calendarEventId = maybeCalendarEventId.value;
      const { maybeIsEventInCalendar } = this.state;

      if (maybeIsEventInCalendar.isNone()) {
        return <LoadingButton style={styles.buttonStyle} block={true} />;
      }

      const isEventInCalendar = maybeIsEventInCalendar.value;

      if (isEventInCalendar) {
        // Event is device calendar. We need a button to remove it.
        return (
          <Button
            style={styles.buttonStyle}
            block={true}
            onPress={() => this.removeEventFromCalendar(calendarEventId)}
          >
            <Text>Remove event</Text>
          </Button>
        );
      }
    }

    return (
      <Button style={styles.buttonStyle} block={true} onPress={this.addEvent}>
        <Text>Add event</Text>
      </Button>
    );
  }

  public componentDidMount() {
    const { maybeCalendarEventId } = this.props;

    if (maybeCalendarEventId.isSome()) {
      setTimeout(
        () => this.checkIfEventInCalendar(maybeCalendarEventId.value),
        5000
      );
    }
  }

  public componentDidUpdate(prevProps: Props) {
    const { maybeCalendarEventId } = this.props;
    const { maybeCalendarEventId: prevMaybeCalendarEventId } = prevProps;

    if (
      maybeCalendarEventId !== prevMaybeCalendarEventId &&
      maybeCalendarEventId.isSome()
    ) {
      this.setState({
        maybeIsEventInCalendar: none
      });
      setTimeout(
        () => this.checkIfEventInCalendar(maybeCalendarEventId.value),
        5000
      );
    }
  }
}

export default withLightModalContext(CalendarEventButton);
