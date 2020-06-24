import { fromNullable, fromPredicate } from "fp-ts/lib/Option";
import { Text, View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import { CreatedMessageWithContent } from "../../../definitions/backend/CreatedMessageWithContent";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { ReduxProps } from "../../store/actions/types";
import { PaidReason } from "../../store/reducers/entities/payments";
import { CTA } from "../../types/MessageCTA";
import {
  getCTA,
  handleCtaAction,
  hasCTAValidActions,
  isCtaActionValid,
  isExpired,
  paymentExpirationInfo
} from "../../utils/messages";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import CalendarEventButton from "./CalendarEventButton";
import PaymentButton from "./PaymentButton";

type Props = {
  message: CreatedMessageWithContent;
  service?: ServicePublic;
  payment?: PaidReason;
} & ReduxProps;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row"
  }
});

/**
 * A component to show the action buttons of a message.
 * For messages with the proper configuration renders, on a row:
 * - a calendar icon
 * - a button to add/remove a calendar event
 * - a button to show/start a payment
 */
class MessageDetailCTABar extends React.PureComponent<Props> {
  get paymentExpirationInfo() {
    return paymentExpirationInfo(this.props.message);
  }

  get paid(): boolean {
    return this.props.payment !== undefined;
  }

  get isPaymentExpired() {
    return this.paymentExpirationInfo.fold(false, info => isExpired(info));
  }

  get dueDate() {
    return fromNullable(this.props.message.content.due_date);
  }

  // Render a button to add/remove an event related to the message in the calendar
  private renderCalendarEventButton = () => {
    // The add/remove reminder button is hidden:
    // - if the message hasn't a due date
    // - if the message has a payment and it has been paid or is expired
    return this.dueDate
      .chain(fromPredicate(() => !this.paid && !this.isPaymentExpired))
      .fold(null, _ => {
        return <CalendarEventButton message={this.props.message} />;
      });
  };

  // Render a button to display details of the payment related to the message
  private renderPaymentButton() {
    if (this.paid) {
      return null;
    }
    // The button is displayed if the payment has an expiration date in the future
    return this.paymentExpirationInfo.fold(null, pei => {
      const { message, service } = this.props;
      return (
        <PaymentButton
          paid={this.paid}
          messagePaymentExpirationInfo={pei}
          service={service}
          message={message}
        />
      );
    });
  }

  private renderCTA(cta?: CTA, primary: boolean = false) {
    if (cta === undefined || !isCtaActionValid(cta)) {
      return null;
    }

    return (
      <ButtonDefaultOpacity
        primary={primary}
        disabled={false}
        bordered={!primary}
        onPress={() => handleCtaAction(cta, this.props.dispatch)}
        style={{
          flex: 1
        }}
      >
        <Text>{cta.text}</Text>
      </ButtonDefaultOpacity>
    );
  }

  // render nested cta if the message is not about payment and cta are present and valid
  // inside the message content
  private renderNestedCTAs = () => {
    const maybeNestedCTA = getCTA(this.props.message);
    if (maybeNestedCTA.isSome()) {
      const ctas = maybeNestedCTA.value;
      if (hasCTAValidActions(ctas)) {
        const cta1 = this.renderCTA(ctas.cta_1, true);
        const cta2 = this.renderCTA(ctas.cta_2, false);
        return (
          <View footer={true} style={styles.row}>
            {cta2}
            {cta2 && <View hspacer={true} small={true} />}
            {cta1}
          </View>
        );
      }
    }
    return undefined;
  };

  public render() {
    const paymentButton = this.renderPaymentButton();
    const calendarButton = this.renderCalendarEventButton();
    const footer1 = (paymentButton || calendarButton) && (
      <View footer={true} style={styles.row}>
        {calendarButton}
        {paymentButton && calendarButton && <View hspacer={true} />}
        {paymentButton}
      </View>
    );
    const footer2 = this.renderNestedCTAs();
    return (
      <View>
        {footer2}
        {footer1}
      </View>
    );
  }
}

export default connect()(MessageDetailCTABar);
