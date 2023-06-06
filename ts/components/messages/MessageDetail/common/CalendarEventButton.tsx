import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Text as NBButtonText } from "native-base";
import React from "react";
import {
  Alert,
  Dimensions,
  PermissionsAndroid,
  StyleSheet
} from "react-native";
import { Calendar } from "react-native-calendar-events";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { CreatedMessageWithContentAndAttachments } from "../../../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import I18n from "../../../../i18n";
import {
  addCalendarEvent,
  AddCalendarEventPayload,
  removeCalendarEvent,
  RemoveCalendarEventPayload
} from "../../../../store/actions/calendarEvents";
import { preferredCalendarSaveSuccess } from "../../../../store/actions/persistedPreferences";
import {
  CalendarEvent,
  calendarEventByMessageIdSelector
} from "../../../../store/reducers/entities/calendarEvents/calendarEventsByMessageId";
import { preferredCalendarSelector } from "../../../../store/reducers/persistedPreferences";
import { GlobalState } from "../../../../store/reducers/types";
import { openAppSettings } from "../../../../utils/appSettings";
import {
  checkAndRequestPermission,
  isEventInCalendar,
  removeCalendarEventFromDeviceCalendar,
  saveCalendarEvent,
  searchEventInCalendar
} from "../../../../utils/calendar";
import { requestIOAndroidPermission } from "../../../../utils/permission";
import ButtonDefaultOpacity from "../../../ButtonDefaultOpacity";
import { withLightModalContext } from "../../../helpers/withLightModalContext";
import SelectCalendarModal from "../../../SelectCalendarModal";
import { LightModalContextInterface } from "../../../ui/LightModal";
import { Icon } from "../../../core/icons";
import { HSpacer } from "../../../core/spacer/Spacer";

type OwnProps = {
  message: CreatedMessageWithContentAndAttachments;
  small?: boolean;
  medium?: boolean;
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

const styles = StyleSheet.create({
  button: {
    flex: 1
  },
  oneThird: {
    flex: 5
  },
  marginTop1: { marginTop: 1 }
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
  private checkIfEventInCalendar = async (
    calendarEvent: CalendarEvent | undefined
  ) => {
    if (calendarEvent === undefined) {
      this.setState({
        isEventInDeviceCalendar: false
      });
      return;
    }
    const mayBeInCalendar = await isEventInCalendar(calendarEvent.eventId)();
    this.setState({
      isEventInDeviceCalendar: pipe(
        mayBeInCalendar,
        E.fold(
          _ => false,
          s => s
        )
      )
    });
  };

  public async componentDidMount() {
    const { calendarEvent } = this.props;

    // If we have a calendar event in the store associated to this message
    // Check if the event is still in the device calendar
    await this.checkIfEventInCalendar(calendarEvent);
  }

  public async componentDidUpdate(prevProps: Props) {
    // if calenderEvent changes means reminder has been changed
    if (prevProps.calendarEvent !== this.props.calendarEvent) {
      // if a calendarEvent exists we have to check if it really exists as calendar event
      // the event can be removed outside the App.
      await this.checkIfEventInCalendar(this.props.calendarEvent);
    }
  }

  private confirmSaveCalendarEventAlert = (
    calendar: Calendar,
    message: CreatedMessageWithContentAndAttachments,
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

  private addCalendarEventToDeviceCalendar =
    (message: CreatedMessageWithContentAndAttachments, dueDate: Date) =>
    (calendar: Calendar) => {
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
          pipe(
            mayBeEventId,
            O.fold(
              () => {
                saveCalendarEvent(
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
  private onPressHandler = async () => {
    const { calendarEvent, message, preferredCalendar } = this.props;
    const { due_date } = message.content;

    if (due_date === undefined) {
      return;
    }

    await requestIOAndroidPermission(
      PermissionsAndroid.PERMISSIONS.WRITE_CALENDAR,
      {
        title: I18n.t("permissionRationale.calendar.title"),
        message: I18n.t("permissionRationale.calendar.message"),
        buttonPositive: I18n.t("global.buttons.choose")
      }
    );

    // Check the authorization status
    void checkAndRequestPermission()
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
            this.addCalendarEventToDeviceCalendar(
              message,
              due_date
            )(preferredCalendar);
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
            I18n.t("global.genericAlert"),
            I18n.t("messages.cta.calendarPermDenied.title"),
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
    // On small devices use short label
    const reminderText = I18n.t(
      screenWidth <= minScreenWidth
        ? "messages.cta.reminderShort"
        : "messages.cta.reminder"
    );
    const { small, disabled, medium } = this.props;
    const iconName = this.state.isEventInDeviceCalendar ? "completed" : "add";
    return (
      <ButtonDefaultOpacity
        disabled={disabled}
        onPress={this.onPressHandler}
        xsmall={small}
        small={medium}
        bordered={!disabled}
        style={this.props.small ? styles.oneThird : styles.button}
      >
        {/* This condition doesn't make sense. We should replace it using
        a different component (e.g. ButtonOutline) */}
        <Icon name={iconName} color={disabled ? "white" : "blue"} />
        <HSpacer size={4} />
        <NBButtonText style={styles.marginTop1}>{reminderText}</NBButtonText>
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
