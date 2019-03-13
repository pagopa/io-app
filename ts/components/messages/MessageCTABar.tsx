import { isSome, none } from "fp-ts/lib/Option";
import { RptIdFromString } from "italia-pagopa-commons/lib/pagopa";
import * as pot from "italia-ts-commons/lib/pot";
import { Button, H1, Icon, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import RNCalendarEvents, { Calendar } from "react-native-calendar-events";
import { connect } from "react-redux";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import {
  addCalendarEvent,
  removeCalendarEvent
} from "../../store/actions/calendarEvents";
import { navigateToPaymentTransactionSummaryScreen } from "../../store/actions/navigation";
import { ReduxProps } from "../../store/actions/types";
import { paymentInitializeState } from "../../store/actions/wallet/payment";
import {
  CalendarEvent,
  calendarEventByMessageIdSelector
} from "../../store/reducers/entities/calendarEvents/calendarEventsByMessageId";
import { PaymentByRptIdState } from "../../store/reducers/entities/payments";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import { checkAndRequestPermission } from "../../utils/calendar";
import {
  formatDateAsDay,
  formatDateAsMonth,
  formatDateAsReminder
} from "../../utils/dates";
import {
  formatPaymentAmount,
  getAmountFromPaymentAmount,
  getRptIdFromNoticeNumber
} from "../../utils/payment";
import { showToast } from "../../utils/showToast";
import CalendarIconComponent from "../CalendarIconComponent";
import { withLightModalContext } from "../helpers/withLightModalContext";
import SelectCalendarModal from "../SelectCalendarModal";
import IconFont from "../ui/IconFont";
import { LightModalContextInterface } from "../ui/LightModal";

type OwnProps = {
  message: MessageWithContentPO;
  service: pot.Pot<ServicePublic, Error>;
  containerStyle?: ViewStyle;
  paymentByRptId: PaymentByRptIdState;
  disabled?: boolean;
  small?: boolean;
};

type Props = OwnProps &
  LightModalContextInterface &
  ReturnType<typeof mapStateToProps> &
  ReduxProps;

type State = {
  // Store if the event is in the device calendar
  isEventInCalendar: boolean;
};

const styles = StyleSheet.create({
  mainContainer: {
    display: "flex",
    flex: 1,
    flexDirection: "row"
  },

  reminderContainer: {
    display: "flex",
    flexDirection: "row",
    flex: 6,
    alignItems: "center"
  },

  reminderButtonContainer: {
    marginLeft: 10,
    flex: 12
  },

  reminderButton: {
    backgroundColor: variables.colorWhite
  },

  reminderButtonIcon: {
    marginLeft: 0,
    marginRight: 5
  },

  reminderButtonText: {
    paddingLeft: 0,
    paddingRight: 0
  },

  separatorContainer: {
    width: 10
  },

  paymentContainer: {
    flex: 6
  },

  paymentButtonPaid: {
    backgroundColor: variables.colorWhite,
    borderWidth: 1,
    borderColor: "#00C5CA"
  },

  paymentButtonText: {
    paddingLeft: 0,
    paddingRight: 0
  },

  paymentButtonPaidText: {
    color: "#00C5CA"
  },

  paymentButtonIcon: {
    marginLeft: 0,
    marginRight: 5
  },

  selectCalendaModalHeader: {
    marginBottom: 25
  }
});

const SelectCalendarModalHeader = (
  <H1 style={styles.selectCalendaModalHeader}>
    {I18n.t("messages.cta.reminderCalendarSelect")}
  </H1>
);

class MessageCTABar extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isEventInCalendar: false
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

  private renderReminderCTA(
    dueDate: NonNullable<MessageWithContentPO["content"]["due_date"]>,
    useShortLabel: boolean
  ) {
    const { message, calendarEvent, showModal, disabled } = this.props;
    const { isEventInCalendar } = this.state;

    const calendarIconComponentSize = this.props.small
      ? "32" : "48";

    // Create an action to add or remove the event
    const onPressHandler = () => {
      // Check the authorization status
      checkAndRequestPermission()
        .then(hasPermission => {
          if (hasPermission) {
            if (calendarEvent && isEventInCalendar) {
              // If the event is in the calendar remove it
              this.removeReminderFromCalendar(calendarEvent);
            } else {
              // The event need to be added
              // Show a modal to let the user select a calendar
              showModal(
                <SelectCalendarModal
                  onCancel={this.onSelectCalendarCancel}
                  onCalendarSelected={this.addReminderToCalendar(
                    message,
                    dueDate
                  )}
                  header={SelectCalendarModalHeader}
                />
              );
            }
          }
        })
        // No permission to add/remove the reminder
        .catch();
    };

    return (
      <View style={styles.reminderContainer}>
        <CalendarIconComponent
          height={calendarIconComponentSize}
          width={calendarIconComponentSize}
          month={formatDateAsMonth(dueDate)}
          day={formatDateAsDay(dueDate)}
          backgroundColor={variables.brandDarkGray}
          textColor={variables.colorWhite}
        />

        <View style={styles.reminderButtonContainer}>
          <Button
            block={true}
            xsmall={this.props.small}
            bordered={true}
            onPress={onPressHandler}
            disabled={disabled}
            style={styles.reminderButton}
          >
            {isEventInCalendar ? (
              <IconFont
                name="io-tick-big"
                style={styles.reminderButtonIcon}
                color={variables.contentPrimaryBackground}
              />
            ) : (
              <Icon
                name={"plus"}
                style={styles.reminderButtonIcon}
                color={variables.contentPrimaryBackground}
              />
            )}
            <Text style={styles.reminderButtonText}>
              {I18n.t(
                useShortLabel
                  ? "messages.cta.reminderShort"
                  : "messages.cta.reminder"
              )}
            </Text>
          </Button>
        </View>
      </View>
    );
  }

  private renderPaymentCTA(
    paymentData: NonNullable<MessageWithContentPO["content"]["payment_data"]>,
    potService: pot.Pot<ServicePublic, Error>,
    paymentByRptId: PaymentByRptIdState
  ) {
    const { disabled } = this.props;
    const amount = getAmountFromPaymentAmount(paymentData.amount);

    const rptId = pot.getOrElse(
      pot.map(potService, service =>
        getRptIdFromNoticeNumber(
          service.organization_fiscal_code,
          paymentData.notice_number
        )
      ),
      none
    );

    const isPaid = rptId
      .map(RptIdFromString.encode)
      .map(_ => paymentByRptId[_] !== undefined)
      .getOrElse(false);

    const onPaymentCTAPress =
      !isPaid && isSome(amount) && isSome(rptId)
        ? () => {
            this.props.dispatch(paymentInitializeState());
            this.props.dispatch(
              navigateToPaymentTransactionSummaryScreen({
                rptId: rptId.value,
                initialAmount: amount.value
              })
            );
          }
        : undefined;

    return (
      <View style={styles.paymentContainer}>
        <Button
          block={true}
          xsmall={this.props.small}
          onPress={onPaymentCTAPress}
          disabled={disabled || onPaymentCTAPress === undefined || isPaid}
          style={isPaid ? styles.paymentButtonPaid : undefined}
        >
          {isPaid && (
            <IconFont
              name="io-tick-big"
              style={styles.paymentButtonIcon}
              color={"#00C5CA"}
            />
          )}
          <Text
            style={[
              styles.paymentButtonText,
              isPaid ? styles.paymentButtonPaidText : undefined
            ]}
          >
            {I18n.t(isPaid ? "messages.cta.paid" : "messages.cta.pay", {
              amount: formatPaymentAmount(paymentData.amount)
            })}
          </Text>
        </Button>
      </View>
    );
  }

  public render() {
    const { message, service, containerStyle, paymentByRptId } = this.props;

    const { due_date, payment_data } = message.content;

    if (due_date !== undefined || payment_data !== undefined) {
      return (
        <View style={[styles.mainContainer, containerStyle]}>
          {due_date !== undefined &&
            this.renderReminderCTA(due_date, payment_data !== undefined)}

          {due_date !== undefined &&
            payment_data !== undefined && (
              <View style={styles.separatorContainer} />
            )}

          {payment_data !== undefined &&
            this.renderPaymentCTA(payment_data, service, paymentByRptId)}
        </View>
      );
    }

    return null;
  }

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
                  isEventInCalendar: true
                });
              } else {
                // The event is in the store but not in the device calendar.
                // Remove it from store too
                this.props.dispatch(removeCalendarEvent(calendarEvent));
              }
            })
            .catch();
        }
      })
      .catch();
  };

  private onSelectCalendarCancel = () => {
    this.props.hideModal();
  };

  private addReminderToCalendar = (
    message: MessageWithContentPO,
    dueDate: Date
  ) => (calendar: Calendar) => {
    const title = I18n.t("messages.cta.reminderTitle", {
      title: message.content.subject
    });
    this.props.hideModal();
    RNCalendarEvents.saveEvent(title, {
      title,
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
        this.props.dispatch(
          addCalendarEvent({
            messageId: message.id,
            eventId
          })
        );
        this.setState({
          isEventInCalendar: true
        });
      })
      .catch(_ =>
        showToast(I18n.t("messages.cta.reminderAddFailure"), "danger")
      );
  };

  private removeReminderFromCalendar = (calendarEvent: CalendarEvent) => {
    RNCalendarEvents.removeEvent(calendarEvent.eventId)
      .then(_ => {
        showToast(I18n.t("messages.cta.reminderRemoveSuccess"), "success");
        this.props.dispatch(
          removeCalendarEvent({ messageId: calendarEvent.messageId })
        );
        this.setState({
          isEventInCalendar: false
        });
      })
      .catch(_ =>
        showToast(I18n.t("messages.cta.reminderRemoveFailure"), "danger")
      );
  };
}

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => ({
  calendarEvent: calendarEventByMessageIdSelector(ownProps.message.id)(state)
});

export default connect(mapStateToProps)(withLightModalContext(MessageCTABar));
