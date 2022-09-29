import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { capitalize } from "lodash";
import { View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import { CreatedMessageWithContentAndAttachments } from "../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { euCovidCertificateEnabled } from "../../config";
import { ViewEUCovidButton } from "../../features/euCovidCert/components/ViewEUCovidButton";
import { Dispatch } from "../../store/actions/types";
import { PaidReason } from "../../store/reducers/entities/payments";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import { formatDateAsDay, formatDateAsMonth } from "../../utils/dates";
import {
  getCTA,
  isExpirable,
  isExpired,
  isExpiring,
  paymentExpirationInfo
} from "../../utils/messages";
import { IOColors } from "../core/variables/IOColors";
import ExtractedCTABar from "../cta/ExtractedCTABar";
import CalendarEventButton from "./CalendarEventButton";
import CalendarIconComponent from "./CalendarIconComponent";

type OwnProps = {
  message: CreatedMessageWithContentAndAttachments;
  onEUCovidCTAPress?: () => void;
  service?: ServicePublic;
  payment?: PaidReason;
  disabled?: boolean;
};

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  topContainer: {
    flexDirection: "row"
  },
  topContainerLarge: {
    paddingVertical: customVariables.contentPadding / 2,
    paddingHorizontal: customVariables.contentPadding,
    backgroundColor: IOColors.greyUltraLight
  },
  topContainerPaid: {
    paddingVertical: 0,
    paddingHorizontal: 0
  }
});

/**
 * A component to show the action buttons of a message.
 * For messages with the proper configuration renders, on a row:
 * - a calendar icon
 * - a button to add/remove a calendar event
 * - a button to show/start a payment
 * - cta defined inside the markdown content as front-matter
 */
class MessageListCTABar extends React.PureComponent<Props> {
  get paymentExpirationInfo() {
    return paymentExpirationInfo(this.props.message);
  }

  get paid(): boolean {
    return this.props.payment !== undefined;
  }

  get isPaymentExpirable() {
    return pipe(
      this.paymentExpirationInfo,
      O.fold(() => false, isExpirable)
    );
  }

  get isPaymentExpired() {
    return pipe(
      this.paymentExpirationInfo,
      O.fold(() => false, isExpired)
    );
  }

  get isPaymentExpiring() {
    return pipe(
      this.paymentExpirationInfo,
      O.fold(() => false, isExpiring)
    );
  }

  get hasPaymentData() {
    return pipe(
      this.paymentExpirationInfo,
      O.fold(
        () => false,
        _ => true
      )
    );
  }

  get dueDate(): O.Option<Date> {
    return O.fromNullable(this.props.message.content.due_date);
  }

  private renderEUCovidViewCTA() {
    return (
      euCovidCertificateEnabled &&
      this.props.message.content.eu_covid_cert && (
        <ViewEUCovidButton onPress={this.props.onEUCovidCTAPress} />
      )
    );
  }

  private renderCalendarIcon = () => {
    const { dueDate } = this;

    // The calendar icon is shown if:
    // - the message has a due date
    // - the payment related to the message is not yet paid
    // - the payment related to the message is not yet expired
    if (O.isSome(dueDate) && !this.paid && !this.isPaymentExpired) {
      return (
        <CalendarIconComponent
          small={true}
          month={capitalize(formatDateAsMonth(dueDate.value))}
          day={formatDateAsDay(dueDate.value)}
          backgroundColor={IOColors.bluegrey}
          textColor={IOColors.white}
        />
      );
    }
    return undefined;
  };

  // Render a button to add/remove an event related to the message in the calendar
  private renderCalendarEventButton = () =>
    // The add/remove reminder button is shown if:
    // - if the message has a due date
    // - if the message has a payment and it is not paid nor expired
    pipe(
      this.dueDate,
      O.filter(() => !this.paid && !this.isPaymentExpired),
      O.fold(
        () => undefined,
        _ => (
          <CalendarEventButton
            small={true}
            disabled={this.props.disabled}
            message={this.props.message}
          />
        )
      )
    );

  public render() {
    const maybeServiceMetadata = this.props.service?.service_metadata;
    const calendarIcon = this.renderCalendarIcon();
    const calendarEventButton = this.renderCalendarEventButton();
    const euCovidCertCTA = this.renderEUCovidViewCTA();
    const maybeCTA = getCTA(
      this.props.message,
      maybeServiceMetadata,
      this.props.service?.service_id
    );
    const isPaymentStillValid =
      !this.isPaymentExpirable || !this.isPaymentExpired;
    const nestedCTA =
      !this.hasPaymentData && O.isSome(maybeCTA) ? (
        <ExtractedCTABar
          ctas={maybeCTA.value}
          xsmall={true}
          dispatch={this.props.dispatch}
          serviceMetadata={maybeServiceMetadata}
          service={this.props.service}
        />
      ) : null;
    /**
     * cta priority
     * 1. eu covid
     * 2. nested CTA (cta included in message content front-matter)
     * 3. calendar
     */
    const content =
      euCovidCertCTA ||
      nestedCTA ||
      (isPaymentStillValid && (calendarIcon || calendarEventButton) && (
        <>
          {calendarIcon}
          {calendarIcon && <View hspacer={true} small={true} />}
          {calendarEventButton}
          {calendarEventButton && <View hspacer={true} small={true} />}
        </>
      ));
    if (!content) {
      return null;
    }
    return (
      <>
        <View spacer={true} large={true} />
        <View
          style={[styles.topContainer, this.paid && styles.topContainerPaid]}
          accessible={false}
          accessibilityElementsHidden={true}
          importantForAccessibility={"no-hide-descendants"}
        >
          {content}
        </View>
      </>
    );
  }
}

const mapStateToProps = (_: GlobalState) => ({});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatch
});

export default connect(mapStateToProps, mapDispatchToProps)(MessageListCTABar);
