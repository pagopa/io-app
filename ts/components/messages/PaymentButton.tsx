import { Text } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import { MessagePaymentExpirationInfo, isExpired, isUnexpirable } from "../../utils/messages";
import { formatPaymentAmount } from "../../utils/payment";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import IconFont from "../ui/IconFont";

type Props = {
  paid: boolean;
  messagePaymentExpirationInfo: MessagePaymentExpirationInfo;
  small?: boolean;
  disabled?: boolean;
  onPress?: () => void;
};

const styles = StyleSheet.create({
  button: {
    flex: 1
  }
});

const getButtonText = (
  messagePaymentExpirationInfo: MessagePaymentExpirationInfo,
  paid: boolean
): string => {
  const { amount } = messagePaymentExpirationInfo;

  if (paid) {
    return I18n.t("messages.cta.paid", {
      amount: formatPaymentAmount(amount)
    });
  }

  if (isExpired(messagePaymentExpirationInfo)) {
    return I18n.t("messages.cta.payment.expired");
  }

  return I18n.t("messages.cta.pay", {
    amount: formatPaymentAmount(amount)
  });
};

/**
 * A component to render the button related to the payment
 * paired with a message.
 */
class PaymentButton extends React.PureComponent<Props> {

  private hideIcon = isUnexpirable(this.props.messagePaymentExpirationInfo) || isExpired(this.props.messagePaymentExpirationInfo) || !this.props.small;

  private paidButton = (
    <ButtonDefaultOpacity
          xsmall={this.props.small}
          gray={true}
          style={styles.button}
        >
          <IconFont
            name={"io-tick-big"}
          />
          <Text>
            {getButtonText(this.props.messagePaymentExpirationInfo, true)}
          </Text>
        </ButtonDefaultOpacity>
  );

  public render() {
    const {
      paid,
      messagePaymentExpirationInfo,
      small,
      disabled,
      onPress
    } = this.props; 

    if (paid) {
      return this.paidButton;
    }

    return (
      <ButtonDefaultOpacity
        primary={!isExpired(messagePaymentExpirationInfo) || !disabled}
        disabled={disabled}
        onPress={onPress}
        darkGray={isExpired(messagePaymentExpirationInfo)}
        xsmall={small}
        small={!small}
        style={
          styles.button
        }
      >
        {!this.hideIcon ||
          (paid && (
            <IconFont
              name={"io-timer"}
              color={!disabled ? customVariables.brandHighlight : undefined}
            />
          ))}
        <Text
        >
          {getButtonText(messagePaymentExpirationInfo, false)}
        </Text>
      </ButtonDefaultOpacity>
    );
  }
}

export default PaymentButton;
