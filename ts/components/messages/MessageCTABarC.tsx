import React from "react";
import { connect } from "react-redux";

import { CreatedMessageWithContent } from "../../../definitions/backend/CreatedMessageWithContent";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { PaidReason } from "../../store/reducers/entities/payments";
import { withLightModalContext } from "../helpers/withLightModalContext";
import { LightModalContextInterface } from "../ui/LightModal";
import { GlobalState } from "../../store/reducers/types";
import {
  calendarEventByMessageIdSelector,
  CalendarEvent
} from "../../store/reducers/entities/calendarEvents/calendarEventsByMessageId";
import { checkAndRequestPermission } from "../../utils/calendar";
import RNCalendarEvents, { Calendar } from "react-native-calendar-events";
import { View, Button, Text, H3 } from "native-base";
import CalendarIconComponent from "../CalendarIconComponent";
import { capitalize } from "lodash";
import {
  formatDateAsMonth,
  formatDateAsDay,
  formatDateAsReminder
} from "../../utils/dates";
import variables from "../../theme/variables";
import IconFont from "../ui/IconFont";
import I18n from "../../i18n";
import {
  RemoveCalendarEventPayload,
  removeCalendarEvent,
  AddCalendarEventPayload,
  addCalendarEvent
} from "../../store/actions/calendarEvents";
import { Dispatch } from "../../store/actions/types";
import { StyleSheet, Alert } from "react-native";
import SelectCalendarModal from "../SelectCalendarModal";
import { openAppSettings } from "../../utils/appSettings";
import { showToast } from "../../utils/showToast";
import { preferredCalendarSaveSuccess } from "../../store/actions/persistedPreferences";
import CalendarEventButton from "./CalendarEventButton";
import PaymentButton from "./PaymentButton";

type OwnProps = {
  message: CreatedMessageWithContent;
  service?: ServicePublic;
  payment?: PaidReason;
  small?: boolean;
  disabled?: boolean;
};

type Props = OwnProps &
  LightModalContextInterface &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type State = {
  // Store if the event is in the device calendar
  isEventInDeviceCalendar: boolean;
};

const styles = StyleSheet.create({
  mainContainer: {
    display: "flex",
    flex: 1,
    flexDirection: "row"
  },

  ctaButton: {
    flex: 1,
    paddingHorizontal: 16
  },
  ctaButtonText: {
    paddingRight: 0,
    paddingLeft: 0
  },
  ctaButtonTextWithLeftIcon: {
    marginLeft: 4,
    paddingRight: 0,
    paddingLeft: 0,
    lineHeight: 20
  },

  calendarEventCTAWrapper: {
    display: "flex",
    flex: 1,
    flexDirection: "row"
  },
  calendarEventCTAButton: {
    marginLeft: 8
  },

  selectCalendaModalHeader: {
    lineHeight: 40
  }
});

const SelectCalendarModalHeader = (
  <View>
    <H3 style={styles.selectCalendaModalHeader}>
      {I18n.t("messages.cta.reminderCalendarSelect")}
    </H3>
    <View spacer={true} large={true} />
  </View>
);

class MessageCTABarC extends React.PureComponent<Props, State> {
  /**
   * A function to check if the eventId of the CalendarEvent stored in redux
   * is really/still in the device calendar.
   * It is important to make this check because the event can be removed outside
   * the App.
   */
  private checkIfEventInCalendar = (calendarEvent: CalendarEvent) => {
    checkAndRequestPermission()
      .then(hasPermission => {
        if (hasPermission) {
          RNCalendarEvents.findEventById(calendarEvent.eventId)
            .then(event => {
              if (event) {
                // The event is in the store and also in the device calendar
                // Update the state to display and handle the reminder button correctly
                this.setState({
                  isEventInDeviceCalendar: true
                });
              } else {
                // The event is in the store but not in the device calendar.
                // Remove it from store too
                this.props.dispatchRemoveCalendarEvent(calendarEvent);
              }
            })
            .catch();
        }
      })
      .catch();
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
      this.props.dispatchPreferredCalendarSaveSuccess(calendar);
    }

    RNCalendarEvents.saveEvent(title, {
      calendarId: calendar.id,
      startDate: formatDateAsReminder(dueDate),
      endDate: formatDateAsReminder(dueDate),
      allDay: true,
      alarms: []
    })
      .then(eventId => {
        showToast(
          I18n.t("messages.cta.reminderAddSuccess", {
            title,
            calendarTitle: calendar.title
          }),
          "success"
        );
        // Add the calendar event to the store
        this.props.dispatchAddCalendarEvent({
          messageId: message.id,
          eventId
        });

        this.setState({
          isEventInDeviceCalendar: true
        });
      })
      .catch(_ =>
        showToast(I18n.t("messages.cta.reminderAddFailure"), "danger")
      );
  };

  private removeCalendarEventFromDeviceCalendar = (
    calendarEvent: CalendarEvent
  ) => {
    RNCalendarEvents.removeEvent(calendarEvent.eventId)
      .then(_ => {
        showToast(I18n.t("messages.cta.reminderRemoveSuccess"), "success");
        this.props.dispatchRemoveCalendarEvent({
          messageId: calendarEvent.messageId
        });
        this.setState({
          isEventInDeviceCalendar: false
        });
      })
      .catch(_ =>
        showToast(I18n.t("messages.cta.reminderRemoveFailure"), "danger")
      );
  };

  private renderCalendarEventCTA = (isPaymentExpired: boolean) => {
    const {
      message,
      small,
      disabled,
      calendarEvent,
      preferredCalendar,
      hideModal,
      showModal
    } = this.props;
    const { isEventInDeviceCalendar } = this.state;

    const { due_date } = message.content;

    if (due_date !== undefined) {
      const calendarIconComponentSize = small ? 32 : 48;

      // Create an action to add or remove the event
      const onPressHandler = () => {
        // Check the authorization status
        checkAndRequestPermission()
          .then(calendarPermission => {
            if (calendarPermission.authorized) {
              if (calendarEvent && isEventInDeviceCalendar) {
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
                        this.removeCalendarEventFromDeviceCalendar(
                          calendarEvent
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
                showModal(
                  <SelectCalendarModal
                    onCancel={hideModal}
                    onCalendarSelected={this.addCalendarEventToDeviceCalendar(
                      message,
                      due_date
                    )}
                    header={SelectCalendarModalHeader}
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

      return (
        <View style={styles.calendarEventCTAWrapper}>
          <CalendarIconComponent
            height={calendarIconComponentSize}
            width={calendarIconComponentSize}
            month={capitalize(formatDateAsMonth(due_date))}
            day={formatDateAsDay(due_date)}
            backgroundColor={variables.brandDarkGray}
            textColor={variables.colorWhite}
          />

          <View style={{ marginLeft: 8 }} />

          {!isPaymentExpired && (
            <CalendarEventButton
              isEventInDeviceCalendar={isEventInDeviceCalendar}
              small={true}
              disabled={disabled}
              onPress={onPressHandler}
            />
          )}
        </View>
      );
    }

    return null;
  };

  private getExpirationState = (
    dueDate?: Date,
    invalidAfterDueDate?: boolean
  ) => {
    if (dueDate !== undefined && invalidAfterDueDate) {
      const remainingMilliseconds = dueDate.getTime() - Date.now();

      if (remainingMilliseconds < 0) {
        return "EXPIRED";
      }

      if (remainingMilliseconds < 1000 * 60 * 60 * 24) {
        return "EXPIRING";
      }
    }

    return "VALID";
  };

  private renderPaymentCTA = () => {
    const { message, small } = this.props;

    const { payment_data } = message.content;

    if (payment_data !== undefined) {
      const {
        content: { due_date }
      } = message;
      const { payment } = this.props;
      const { amount, invalid_after_due_date } = payment_data;

      const paid = payment !== undefined;

      const expirationState = this.getExpirationState(
        due_date,
        invalid_after_due_date
      );

      return (
        <PaymentButton
          amount={amount}
          paid={paid}
          expiring={expirationState === "EXPIRING"}
          expired={expirationState === "EXPIRED"}
          small={small}
          onPress={() => 0}
        />
      );
    }

    return null;
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      isEventInDeviceCalendar: false
    };
  }

  public componentDidMount() {
    const { calendarEvent } = this.props;

    // If we have a calendar event in the store associated to this message
    if (calendarEvent) {
      // Check if the event is still in the device calendar
      this.checkIfEventInCalendar(calendarEvent);
    }
  }

  public render() {
    const { message, payment } = this.props;
    const { payment_data, due_date } = message.content;

    // Payment stuff
    if (payment_data) {
      // We have a payment
      const { amount, invalid_after_due_date } = payment_data;

      const paid = payment !== undefined;
      const expirationState = this.getExpirationState(
        due_date,
        invalid_after_due_date
      );
      return null;
    } else {
      const calendarEventCTA = this.renderCalendarEventCTA(false);
      return <View style={styles.mainContainer}>{calendarEventCTA}</View>;
    }
  }
}

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => ({
  calendarEvent: calendarEventByMessageIdSelector(ownProps.message.id)(state),
  preferredCalendar: state.persistedPreferences.preferredCalendar
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatchAddCalendarEvent: (calendarEvent: AddCalendarEventPayload) =>
    dispatch(addCalendarEvent(calendarEvent)),
  dispatchRemoveCalendarEvent: (calendarEvent: RemoveCalendarEventPayload) =>
    dispatch(removeCalendarEvent(calendarEvent)),
  dispatchPreferredCalendarSaveSuccess: (calendar: Calendar) =>
    dispatch(
      preferredCalendarSaveSuccess({
        preferredCalendar: calendar
      })
    )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(MessageCTABarC));
