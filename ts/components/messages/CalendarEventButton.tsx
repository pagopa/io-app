import { Text } from "native-base";
import React from "react";
import { Alert, Dimensions, StyleSheet } from "react-native";
import RNCalendarEvents, { Calendar } from "react-native-calendar-events";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { CreatedMessageWithContent } from "../../../definitions/backend/CreatedMessageWithContent";
import I18n from "../../i18n";
import {
  addCalendarEvent,
  AddCalendarEventPayload,
  removeCalendarEvent,
  RemoveCalendarEventPayload
} from "../../store/actions/calendarEvents";
import { preferredCalendarSaveSuccess } from "../../store/actions/persistedPreferences";
import {
  CalendarEvent,
  calendarEventByMessageIdSelector
} from "../../store/reducers/entities/calendarEvents/calendarEventsByMessageId";
import { preferredCalendarSelector } from "../../store/reducers/persistedPreferences";
import { GlobalState } from "../../store/reducers/types";
import { openAppSettings } from "../../utils/appSettings";
import {
  checkAndRequestPermission,
  removeCalendarEventFromDeviceCalendar,
  saveCalendarEvent,
  searchEventInCalendar
} from "../../utils/calendar";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import { withLightModalContext } from "../helpers/withLightModalContext";
import SelectCalendarModal from "../SelectCalendarModal";
import IconFont from "../ui/IconFont";
import { LightModalContextInterface } from "../ui/LightModal";

type OwnProps = {
  message: CreatedMessageWithContent;
  small?: boolean;
  disabled?: boolean;
};

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  LightModalContextInterface;

type State = Readonly<{
  // Store if the event is in the device calendar
  isEventInDeviceCalendar: boolean;
}>;

const screenWidth = Dimensions.get("window").width;
const minScreenWidth = 320;
// On small devices use short label
const reminderText = I18n.t(
  screenWidth <= minScreenWidth
    ? "messages.cta.reminderShort"
    : "messages.cta.reminder"
);

const styles = StyleSheet.create({
  button: {
    flex: 1
  }
});

class CalendarEventButton extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isEventInDeviceCalendar: false
    };
  }

  /**
   * A function to check if the eventId of the CalendarEvent stored in redux
   * is really/still in the device calendar.
   * It is important to make this check because the event can be removed outside
   * the App.
   */
  private checkIfEventInCalendar = (
    calendarEvent: CalendarEvent | undefined
  ) => {
    if (calendarEvent === undefined) {
      this.setState({
        isEventInDeviceCalendar: false
      });
      return;
    }
    checkAndRequestPermission()
      .then(
        hasPermission => {
          if (hasPermission) {
            RNCalendarEvents.findEventById(calendarEvent.eventId)
              .then(
                event => {
                  if (event) {
                    // The event is in the store and also in the device calendar
                    // Update the state to display and handle the reminder button correctly
                    this.setState({
                      isEventInDeviceCalendar: true
                    });
                  } else {
                    // The event is in the store but not in the device calendar.
                    // Remove it from store too
                    this.props.removeCalendarEvent(calendarEvent);
                  }
                },
                // handle promise rejection
                () => {
                  this.setState({
                    isEventInDeviceCalendar: false
                  });
                }
              )
              .catch();
          }
        },
        // handle promise rejection
        // tslint:disable-next-line: no-identical-functions
        () => {
          this.setState({
            isEventInDeviceCalendar: false
          });
        }
      )
      .catch();
  };

  public componentDidMount() {
    const { calendarEvent } = this.props;

    // If we have a calendar event in the store associated to this message
    // Check if the event is still in the device calendar
    this.checkIfEventInCalendar(calendarEvent);
  }

  public componentDidUpdate(prevProps: Props) {
    // if calenderEvent changes means reminder has been changed
    if (prevProps.calendarEvent !== this.props.calendarEvent) {
      // if a calendarEvent exists we have to check if it really exists as calendar event
      // the event can be removed outside the App.
      this.checkIfEventInCalendar(this.props.calendarEvent);
    }
  }

  private confirmSaveCalendarEventAlert = (
    calendar: Calendar,
    message: CreatedMessageWithContent,
    dueDate: Date,
    title: string,
    eventId: string
  ) =>
    Alert.alert(
      I18n.t("messages.cta.reminderAlertTitle"),
      I18n.t("messages.cta.reminderAlertDescription"),
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("messages.cta.reminderAlertKeep"),
          style: "default",
          onPress: () =>
            this.setState(
              {
                isEventInDeviceCalendar: true
              },
              () => {
                // Add the calendar event to the store
                this.props.addCalendarEvent({
                  messageId: message.id,
                  eventId
                });
              }
            )
        },
        {
          text: I18n.t("messages.cta.reminderAlertAdd"),
          style: "default",
          onPress: () =>
            saveCalendarEvent(
              calendar,
              message,
              dueDate,
              title,
              this.addCalendarEvent
            )
        }
      ],
      { cancelable: false }
    );

  // Add the calendar event to the store
  private addCalendarEvent = (calendarEvent: AddCalendarEventPayload) => {
    this.props.addCalendarEvent({
      messageId: calendarEvent.messageId,
      eventId: calendarEvent.eventId
    });

    this.setState({
      isEventInDeviceCalendar: true
    });
  };

  private addCalendarEventToDeviceCalendar = (
    message: CreatedMessageWithContent,
    dueDate: Date
  ) => (calendar: Calendar) => {
    const title = I18n.t("messages.cta.reminderTitle", {
      title: message.content.subject
    });

    const { preferredCalendar } = this.props;

    this.props.hideModal();

    if (preferredCalendar === undefined) {
      this.props.preferredCalendarSaveSuccess(calendar);
    }

    searchEventInCalendar(dueDate, title)
      .then(mayBeEventId =>
        mayBeEventId.foldL(
          async () => {
            await saveCalendarEvent(
              calendar,
              message,
              dueDate,
              title,
              this.addCalendarEvent
            );
          },
          async eventId => {
            this.confirmSaveCalendarEventAlert(
              calendar,
              message,
              dueDate,
              title,
              eventId
            );
          }
        )
      )
      .catch(() =>
        saveCalendarEvent(calendar, message, dueDate, title, addCalendarEvent)
      );
  };

  private onRemoveCalendarEvent = (calendarEvent: CalendarEvent) => {
    this.props.removeCalendarEvent({
      messageId: calendarEvent.messageId
    });
    this.setState({
      isEventInDeviceCalendar: false
    });
  };

  // Create an action to add or remove the event
  private onPressHandler = () => {
    const { calendarEvent, message, preferredCalendar } = this.props;
    const { due_date } = message.content;

    if (due_date === undefined) {
      return;
    }

    // Check the authorization status
    checkAndRequestPermission()
      .then(calendarPermission => {
        if (calendarPermission.authorized) {
          if (this.state.isEventInDeviceCalendar) {
            // If the event is in the calendar prompt an alert and ask for confirmation
            Alert.alert(
              I18n.t("messages.cta.reminderRemoveRequest.title"),
              undefined,
              [
                {
                  text: I18n.t("messages.cta.reminderRemoveRequest.cancel"),
                  style: "cancel"
                },
                {
                  text: I18n.t("messages.cta.reminderRemoveRequest.ok"),
                  style: "destructive",
                  onPress: () => {
                    // after confirmation remove it
                    removeCalendarEventFromDeviceCalendar(
                      calendarEvent,
                      this.onRemoveCalendarEvent
                    );
                  }
                }
              ],
              { cancelable: false }
            );
          } else if (preferredCalendar !== undefined) {
            this.addCalendarEventToDeviceCalendar(message, due_date)(
              preferredCalendar
            );
          } else {
            // The event need to be added
            // Show a modal to let the user select a calendar
            this.props.showModal(
              <SelectCalendarModal
                onCancel={this.props.hideModal}
                onCalendarSelected={this.addCalendarEventToDeviceCalendar(
                  message,
                  due_date
                )}
              />
            );
          }
        } else if (!calendarPermission.asked) {
          // Authorized is false (denied, restricted or undetermined)
          // If the user denied permission previously (not in this session)
          // prompt an alert to inform that his calendar permissions could have been turned off
          Alert.alert(
            I18n.t("messages.cta.calendarPermDenied.title"),
            undefined,
            [
              {
                text: I18n.t("messages.cta.calendarPermDenied.cancel"),
                style: "cancel"
              },
              {
                text: I18n.t("messages.cta.calendarPermDenied.ok"),
                style: "default",
                onPress: () => {
                  // open app settings to turn on the calendar permissions
                  openAppSettings();
                }
              }
            ],
            { cancelable: true }
          );
        }
      })
      // No permission to add/remove the reminder
      .catch();
  };

  public render() {
    const { small, disabled } = this.props;
    const iconName = this.state.isEventInDeviceCalendar
      ? "io-tick-big"
      : "io-plus";
    return (
      <ButtonDefaultOpacity
        disabled={disabled}
        onPress={this.onPressHandler}
        xsmall={small}
        small={!small}
        bordered={!disabled}
        style={styles.button}
      >
        <IconFont name={iconName} />
        <Text>{reminderText}</Text>
      </ButtonDefaultOpacity>
    );
  }
}

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => ({
  preferredCalendar: preferredCalendarSelector(state),
  calendarEvent: calendarEventByMessageIdSelector(ownProps.message.id)(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  removeCalendarEvent: (calendarEvent: RemoveCalendarEventPayload) =>
    dispatch(removeCalendarEvent(calendarEvent)),
  addCalendarEvent: (calendarEvent: AddCalendarEventPayload) =>
    dispatch(addCalendarEvent(calendarEvent)),
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
)(withLightModalContext(CalendarEventButton));
