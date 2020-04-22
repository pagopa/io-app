/**
 * A component to show the action buttons on a message.
 * For messages with the proper configuration, the user can:
 * - add a message-related calendar event
 * - start the message-related payment
 */
import { isToday } from "date-fns";
import { fromNullable, none, Option, some } from "fp-ts/lib/Option";
import { capitalize } from "lodash";
import { Text, View } from "native-base";
import React from "react";
import { Alert, StyleSheet } from "react-native";
import RNCalendarEvents, { Calendar } from "react-native-calendar-events";
import { connect } from "react-redux";

import { CreatedMessageWithContent } from "../../../definitions/backend/CreatedMessageWithContent";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import { NavigationParams } from "../../screens/wallet/payment/TransactionSummaryScreen";
import {
  addCalendarEvent,
  AddCalendarEventPayload,
  removeCalendarEvent,
  RemoveCalendarEventPayload
} from "../../store/actions/calendarEvents";
import {
  navigateToMessageDetailScreenAction,
  navigateToPaymentTransactionSummaryScreen,
  navigateToWalletHome
} from "../../store/actions/navigation";
import { preferredCalendarSaveSuccess } from "../../store/actions/persistedPreferences";
import { loadServiceDetail } from "../../store/actions/services";
import { Dispatch } from "../../store/actions/types";
import { paymentInitializeState } from "../../store/actions/wallet/payment";
import { serverInfoDataSelector } from "../../store/reducers/backendInfo";
import {
  CalendarEvent,
  calendarEventByMessageIdSelector
} from "../../store/reducers/entities/calendarEvents/calendarEventsByMessageId";
import { PaidReason } from "../../store/reducers/entities/payments";
import { isProfileEmailValidatedSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";
import { openAppSettings } from "../../utils/appSettings";
import { isUpdateNeeded } from "../../utils/appVersion";
import {
  checkAndRequestPermission,
  convertLocalCalendarName
} from "../../utils/calendar";
import {
  format,
  formatDateAsDay,
  formatDateAsMonth,
  formatDateAsReminder,
  toLocalDate
} from "../../utils/dates";
import {
  getMessagePaymentExpirationInfo,
  isExpirable,
  isExpired,
  MessagePaymentExpirationInfo
} from "../../utils/messages";
import {
  formatPaymentAmount,
  getAmountFromPaymentAmount,
  getRptIdFromNoticeNumber
} from "../../utils/payment";
import { showToast } from "../../utils/showToast";
import CalendarIconComponent from "../CalendarIconComponent";
import { withLightModalContext } from "../helpers/withLightModalContext";
import SelectCalendarModal from "../SelectCalendarModal";
import StyledIconFont from "../ui/IconFont";
import { LightModalContextInterface } from "../ui/LightModal";
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
  topContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },

  topContainerLarge: {
    paddingVertical: variables.contentPadding / 2,
    paddingHorizontal: variables.contentPadding,
    backgroundColor: variables.brandGray
  },

  topContainerPaid: {
    paddingVertical: 0,
    paddingHorizontal: 0
  },

  bottomContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: variables.contentPadding / 2,
    paddingHorizontal: variables.contentPadding
  },

  bottomContainerValid: {
    backgroundColor: variables.brandGray
  },

  bottomContainerExpiring: {
    backgroundColor: "#D0021B"
  },

  bottomContainerExpired: {
    backgroundColor: variables.brandDarkGray
  },

  bottomContainerText: {
    flex: 1,
    flexWrap: "wrap",
    marginLeft: 16
  }
});

class MessageCTABar extends React.PureComponent<Props, State> {
  private navigateToMessageDetail = () => {
    const { message, navigateToMessageDetail } = this.props;
    navigateToMessageDetail(message.id);
  };

  get paid(): boolean {
    return this.props.payment !== undefined;
  }

  /**
   * Check if an event for endDate with that title already exists in the calendar.
   * Return the event id if it is found
   */
  private searchEventInCalendar = async (
    endDate: Date,
    title: string
  ): Promise<Option<string>> => {
    const startDate = new Date(endDate.getTime());
    return RNCalendarEvents.fetchAllEvents(
      formatDateAsReminder(new Date(startDate.setDate(endDate.getDate() - 1))),
      formatDateAsReminder(endDate)
    )
      .then(
        events => {
          return fromNullable(events)
            .mapNullable(evs =>
              evs.find(e => {
                return (
                  e.title === title &&
                  new Date(e.endDate).getDay() === endDate.getDay()
                );
              })
            )
            .map(ev => some(ev.id))
            .getOrElse(none);
        },
        // handle promise rejection
        () => {
          return none;
        }
      )
      .catch(() => none);
  };

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

  private saveCalendarEvent = (
    calendar: Calendar,
    message: CreatedMessageWithContent,
    dueDate: Date,
    title: string
  ) =>
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
            calendarTitle: convertLocalCalendarName(calendar.title)
          }),
          "success"
        );
        // Add the calendar event to the store
        this.props.addCalendarEvent({
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
            this.saveCalendarEvent(calendar, message, dueDate, title)
        }
      ],
      { cancelable: false }
    );

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

    this.searchEventInCalendar(dueDate, title)
      .then(mayBeEventId =>
        mayBeEventId.foldL(
          async () => {
            await this.saveCalendarEvent(calendar, message, dueDate, title);
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
      .catch(() => this.saveCalendarEvent(calendar, message, dueDate, title));
  };

  private removeCalendarEventFromDeviceCalendar = (
    calendarEvent: CalendarEvent | undefined
  ) => {
    if (calendarEvent) {
      RNCalendarEvents.removeEvent(calendarEvent.eventId)
        .then(_ => {
          showToast(I18n.t("messages.cta.reminderRemoveSuccess"), "success");
          this.props.removeCalendarEvent({
            messageId: calendarEvent.messageId
          });
          this.setState({
            isEventInDeviceCalendar: false
          });
        })
        .catch(_ =>
          showToast(I18n.t("messages.cta.reminderRemoveFailure"), "danger")
        );
    } else {
      showToast(I18n.t("messages.cta.reminderRemoveFailure"), "danger");
    }
  };

  private renderCalendarIcon = (
    maybeMessagePaymentExpirationInfo: Option<MessagePaymentExpirationInfo>
  ) => {
    const { message, small } = this.props;
    const { due_date } = message.content;

    // if the message is relative to a payment and it is paid
    // calendar icon will be never shown
    if (this.paid) {
      return null;
    }
    if (!due_date) {
      return null;
    }

    if (
      !small &&
      maybeMessagePaymentExpirationInfo.isSome() &&
      isExpired(maybeMessagePaymentExpirationInfo.value)
    ) {
      return null;
    }

    const calendarIconComponentSize = small ? 32 : 40;

    const isPaymentExpiring =
      maybeMessagePaymentExpirationInfo.isSome() &&
      maybeMessagePaymentExpirationInfo.value.kind === "EXPIRABLE" &&
      maybeMessagePaymentExpirationInfo.value.expireStatus === "EXPIRING";

    const formattedData = new Date(toLocalDate(due_date));
    return (
      <CalendarIconComponent
        height={calendarIconComponentSize}
        width={calendarIconComponentSize}
        month={capitalize(formatDateAsMonth(formattedData))}
        day={formatDateAsDay(formattedData)}
        backgroundColor={
          isPaymentExpiring
            ? variables.calendarExpirableColor
            : variables.brandDarkGray
        }
        textColor={variables.colorWhite}
      />
    );
  };

  private renderCalendarEventButton = (
    maybeMessagePaymentExpirationInfo: Option<MessagePaymentExpirationInfo>
  ) => {
    const {
      message,
      small,
      disabled,
      calendarEvent,
      preferredCalendar,
      hideModal,
      showModal
    } = this.props;
    const { due_date } = message.content;
    const { isEventInDeviceCalendar } = this.state;

    // if the message is relative to a payment and it is paid
    // reminder will be never shown
    if (this.paid || due_date === undefined) {
      return null;
    }

    if (
      maybeMessagePaymentExpirationInfo.isSome() &&
      isExpired(maybeMessagePaymentExpirationInfo.value)
    ) {
      return null;
    }

    // Create an action to add or remove the event
    const onPressHandler = () => {
      // Check the authorization status
      checkAndRequestPermission()
        .then(calendarPermission => {
          if (calendarPermission.authorized) {
            if (isEventInDeviceCalendar) {
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
                      this.removeCalendarEventFromDeviceCalendar(calendarEvent);
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
      <CalendarEventButton
        isEventInDeviceCalendar={isEventInDeviceCalendar}
        small={small}
        disabled={disabled}
        onPress={onPressHandler}
      />
    );
  };

  private renderPaymentButton(
    maybeMessagePaymentExpirationInfo: Option<MessagePaymentExpirationInfo>
  ) {
    const { message, service, small, disabled } = this.props;

    if (
      maybeMessagePaymentExpirationInfo.isNone() ||
      (!small && isExpired(maybeMessagePaymentExpirationInfo.value))
    ) {
      return null;
    }

    const messagePaymentExpirationInfo =
      maybeMessagePaymentExpirationInfo.value;

    const expired = isExpired(messagePaymentExpirationInfo);
    const rptId = fromNullable(service).chain(_ =>
      getRptIdFromNoticeNumber(
        _.organization_fiscal_code,
        messagePaymentExpirationInfo.noticeNumber
      )
    );
    const amount = getAmountFromPaymentAmount(
      messagePaymentExpirationInfo.amount
    );

    const onPressHandler = expired
      ? this.navigateToMessageDetail
      : !disabled && !this.paid && amount.isSome() && rptId.isSome()
        ? () => {
            this.props.refreshService(message.sender_service_id);
            // TODO: optimize the managment of the payment initialization https://www.pivotaltracker.com/story/show/169702534
            if (
              this.props.isEmailValidated &&
              !this.props.isUpdatedNeededPagoPa
            ) {
              this.props.paymentInitializeState();
              this.props.navigateToPaymentTransactionSummaryScreen({
                rptId: rptId.value,
                initialAmount: amount.value
              });
            } else {
              // Navigating to Wallet home, having the email address is not validated,
              // it will be displayed RemindEmailValidationOverlay
              this.props.navigateToWalletHomeScreen();
            }
          }
        : undefined;

    return (
      <PaymentButton
        paid={this.paid}
        messagePaymentExpirationInfo={messagePaymentExpirationInfo}
        small={small}
        disabled={disabled}
        onPress={onPressHandler}
      />
    );
  }

  /*
  private renderTopContainer = (
    messagePaymentExpirationInfo: MessagePaymentExpirationInfo
  ) => {
    const { small } = this.props;

    if (
      !small &&
      messagePaymentExpirationInfo.kind === "EXPIRABLE" &&
      messagePaymentExpirationInfo.expireStatus === "EXPIRED"
    ) {
      return null;
    }

    const calendarIcon = this.renderCalendarIcon(messagePaymentExpirationInfo);

    const paymentButton = this.renderPaymentButton(
      messagePaymentExpirationInfo
    );

    return (
      <View style={[styles.topContainer, !small && styles.topContainerLarge]}>
        {calendarIcon}
        {paymentButton}
      </View>
    );
  };
  */

  private renderTopContainer = (
    maybeMessagePaymentExpirationInfo: Option<MessagePaymentExpirationInfo>
  ) => {
    const { small } = this.props;

    const calendarIcon = this.renderCalendarIcon(
      maybeMessagePaymentExpirationInfo
    );
    const calendarEventButton = this.renderCalendarEventButton(
      maybeMessagePaymentExpirationInfo
    );
    const paymentButton = this.renderPaymentButton(
      maybeMessagePaymentExpirationInfo
    );
    if (
      calendarIcon !== null ||
      calendarEventButton !== null ||
      paymentButton !== null
    ) {
      return (
        <View
          style={[
            styles.topContainer,
            this.paid ? styles.topContainerPaid : undefined,
            !small && styles.topContainerLarge
          ]}
        >
          {calendarIcon !== null && (
            <React.Fragment>
              {calendarIcon}
              <View style={{ marginLeft: 8 }} />
            </React.Fragment>
          )}

          {calendarEventButton !== null && (
            <React.Fragment>
              {calendarEventButton}
              <View style={{ marginLeft: 8 }} />
            </React.Fragment>
          )}

          {paymentButton}
        </View>
      );
    }

    return null;
  };

  private renderBottomContainer = (
    maybeMessagePaymentExpirationInfo: Option<MessagePaymentExpirationInfo>
  ) => {
    const { small } = this.props;

    if (
      !small &&
      maybeMessagePaymentExpirationInfo.isSome() &&
      isExpirable(maybeMessagePaymentExpirationInfo.value)
    ) {
      const messagePaymentExpirationInfo =
        maybeMessagePaymentExpirationInfo.value;

      const dueDate = messagePaymentExpirationInfo.dueDate;

      if (messagePaymentExpirationInfo.expireStatus === "VALID") {
        const time = format(dueDate, "HH.mm");
        const day = format(dueDate, I18n.t("global.dateFormats.dayMonthYear"));

        const block1 = I18n.t("messages.cta.payment.validAlert.block1");
        const block2 = I18n.t("messages.cta.payment.validAlert.block2", {
          time,
          day
        });

        return (
          <View style={[styles.bottomContainer, styles.bottomContainerValid]}>
            <StyledIconFont name="io-timer" size={24} />
            <Text style={styles.bottomContainerText}>
              {block1} <Text bold={true}>{block2}</Text>
            </Text>
          </View>
        );
      } else if (messagePaymentExpirationInfo.expireStatus === "EXPIRING") {
        const time = format(dueDate, "HH.mm");
        const todayOrTomorrow = isToday(dueDate)
          ? I18n.t("global.date.today")
          : I18n.t("global.date.tomorrow");

        const block1 = I18n.t("messages.cta.payment.expiringAlert.block1");
        const block2 = I18n.t("messages.cta.payment.expiringAlert.block2", {
          todayOrTomorrow
        });
        const block3 = I18n.t("messages.cta.payment.expiringAlert.block3");

        return (
          <View
            style={[styles.bottomContainer, styles.bottomContainerExpiring]}
          >
            <StyledIconFont
              name="io-timer"
              size={24}
              color={variables.colorWhite}
            />
            <Text white={true} style={styles.bottomContainerText}>
              {block1}{" "}
              <Text white={true} bold={true}>
                {block2}
              </Text>{" "}
              {block3}{" "}
              <Text white={true} bold={true}>
                {time}
              </Text>
            </Text>
          </View>
        );
      } else {
        const time = format(dueDate, "HH.mm");
        const day = format(dueDate, I18n.t("global.dateFormats.dayMonthYear"));
        const amount = formatPaymentAmount(messagePaymentExpirationInfo.amount);

        const block1 = I18n.t("messages.cta.payment.expiredAlert.block1");
        const block2 = I18n.t("messages.cta.payment.expiredAlert.block2", {
          amount
        });
        const block3 = I18n.t("messages.cta.payment.expiredAlert.block3");
        const block4 = I18n.t("messages.cta.payment.expiredAlert.block4");
        const block5 = I18n.t("messages.cta.payment.expiredAlert.block5");
        const block6 = I18n.t("messages.cta.payment.expiredAlert.block6");

        return (
          <View style={[styles.bottomContainer, styles.bottomContainerExpired]}>
            <CalendarIconComponent
              height={40}
              width={40}
              month={formatDateAsMonth(dueDate).toUpperCase()}
              day={formatDateAsDay(dueDate)}
              backgroundColor={variables.colorWhite}
              textColor={variables.brandDarkGray}
            />
            <Text white={true} style={styles.bottomContainerText}>
              {block1}{" "}
              <Text white={true} bold={true}>
                {block2}
              </Text>{" "}
              {block3}{" "}
              <Text white={true} bold={true}>
                {block4}
              </Text>{" "}
              {block5}{" "}
              <Text white={true} bold={true}>
                {time}
              </Text>{" "}
              {block6}{" "}
              <Text white={true} bold={true}>
                {day}
              </Text>
            </Text>
          </View>
        );
      }
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

  public render() {
    const { message } = this.props;
    const { payment_data, due_date } = message.content;

    const maybeMessagePaymentExpirationInfo = fromNullable(payment_data).map(
      paymentData => getMessagePaymentExpirationInfo(paymentData, due_date)
    );

    return (
      <React.Fragment>
        {this.renderTopContainer(maybeMessagePaymentExpirationInfo)}
        {this.renderBottomContainer(maybeMessagePaymentExpirationInfo)}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => ({
  calendarEvent: calendarEventByMessageIdSelector(ownProps.message.id)(state),
  preferredCalendar: state.persistedPreferences.preferredCalendar,
  isEmailValidated: isProfileEmailValidatedSelector(state),
  isUpdatedNeededPagoPa: isUpdateNeeded(
    serverInfoDataSelector(state),
    "min_app_version_pagopa"
  )
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  refreshService: (serviceId: string) =>
    dispatch(loadServiceDetail.request(serviceId)),
  navigateToMessageDetail: (messageId: string) =>
    dispatch(navigateToMessageDetailScreenAction({ messageId })),
  navigateToWalletHomeScreen: () => dispatch(navigateToWalletHome()),
  paymentInitializeState: () => dispatch(paymentInitializeState()),
  navigateToPaymentTransactionSummaryScreen: (params: NavigationParams) =>
    dispatch(navigateToPaymentTransactionSummaryScreen(params)),
  addCalendarEvent: (calendarEvent: AddCalendarEventPayload) =>
    dispatch(addCalendarEvent(calendarEvent)),
  removeCalendarEvent: (calendarEvent: RemoveCalendarEventPayload) =>
    dispatch(removeCalendarEvent(calendarEvent)),
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
)(withLightModalContext(MessageCTABar));
