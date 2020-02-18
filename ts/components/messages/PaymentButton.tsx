/**
 * A component to render the button related to a payment
 * pired with a message.
 *
 */
import { Text } from "native-base";
import React, { ComponentProps } from "react";
import { StyleSheet } from "react-native";

import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import { MessagePaymentExpirationInfo } from "../../utils/messages";
import { formatPaymentAmount } from "../../utils/payment";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import IconFont from "../ui/IconFont";

type Props = {
  paid: boolean;
  messagePaymentExpirationInfo: MessagePaymentExpirationInfo;
  small?: boolean;
  disabled?: boolean;
  onPress: ComponentProps<typeof ButtonDefaultOpacity>["onPress"];
};

const baseStyles = StyleSheet.create({
  button: {
    flex: 7,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 0,
    height: 40
  },

  icon: {
    marginRight: 4,
    lineHeight: 32
  },

  text: {
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    fontSize: 14,
    lineHeight: 20
  }
});

const unexpirableStyles = StyleSheet.create({
  button: {
    backgroundColor: customVariables.brandPrimary
  },

  icon: {
    color: customVariables.colorWhite
  },

  text: {
    color: customVariables.colorWhite
  }
});

const validStyles = StyleSheet.create({
  button: {
    backgroundColor: customVariables.brandPrimary
  },

  icon: {
    color: customVariables.colorWhite
  },

  text: {
    color: customVariables.colorWhite
  }
});

const expiredStyles = StyleSheet.create({
  button: {
    backgroundColor: customVariables.brandDarkGray
  },

  icon: {
    color: customVariables.colorWhite
  },

  text: {
    color: customVariables.colorWhite
  }
});

const smallStyles = StyleSheet.create({
  button: {
    height: 32
  },

  icon: {},

  text: {}
});

const disabledStyles = StyleSheet.create({
  button: {
    backgroundColor: "#b5b5b5",
    borderWidth: 0
  },

  icon: {
    color: customVariables.colorWhite
  },

  text: {
    color: customVariables.colorWhite
  }
});

const paidStyles = StyleSheet.create({
  button: {
    backgroundColor: customVariables.brandGray,
    borderWidth: 0
  },

  text: {
    color: customVariables.brandHighlight
  }
});

const getExpirationStyles = (
  messagePaymentExpirationInfo: MessagePaymentExpirationInfo
) => {
  if (messagePaymentExpirationInfo.kind === "UNEXPIRABLE") {
    return unexpirableStyles;
  }

  switch (messagePaymentExpirationInfo.expireStatus) {
    case "VALID":
      return validStyles;
    case "EXPIRING":
      return validStyles;

    default:
      return expiredStyles;
  }
};

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

  if (
    messagePaymentExpirationInfo.kind === "EXPIRABLE" &&
    messagePaymentExpirationInfo.expireStatus === "EXPIRED"
  ) {
    return I18n.t("messages.cta.payment.expired");
  }

  return I18n.t("messages.cta.pay", {
    amount: formatPaymentAmount(amount)
  });
};

class PaymentButton extends React.PureComponent<Props> {
  // tslint:disable-next-line: cognitive-complexity
  public render() {
    const {
      paid,
      messagePaymentExpirationInfo,
      small,
      disabled,
      onPress
    } = this.props;

    const appliedStyles = getExpirationStyles(messagePaymentExpirationInfo);

    const isUnexpirable = messagePaymentExpirationInfo.kind === "UNEXPIRABLE";
    const isExpired =
      messagePaymentExpirationInfo.kind === "EXPIRABLE" &&
      messagePaymentExpirationInfo.expireStatus === "EXPIRED";
    const hideIcon = isUnexpirable || isExpired || !small;

    if (paid) {
      return (
        <ButtonDefaultOpacity
          disabled={true}
          light={true}
          onPress={undefined}
          style={[baseStyles.button, paidStyles.button]}
        >
          <IconFont
            name={"io-tick-big"}
            style={appliedStyles.icon}
            color={customVariables.brandHighlight}
          />
          <Text bold={false} style={paidStyles.text}>
            {getButtonText(messagePaymentExpirationInfo, true)}
          </Text>
        </ButtonDefaultOpacity>
      );
    }

    return (
      <ButtonDefaultOpacity
        disabled={disabled}
        light={true}
        onPress={onPress}
        style={[
          baseStyles.button,
          appliedStyles.button,
          small && smallStyles.button,
          disabled && disabledStyles.button
        ]}
      >
        {!hideIcon ||
          (paid && (
            <IconFont
              name={"io-timer"}
              style={[
                baseStyles.icon,
                appliedStyles.icon,
                disabled && disabledStyles.icon
              ]}
              color={!disabled ? customVariables.brandHighlight : undefined}
            />
          ))}
        <Text
          bold={true}
          style={[
            baseStyles.text,
            appliedStyles.text,
            small && smallStyles.text,
            disabled && disabledStyles.text
          ]}
        >
          {getButtonText(messagePaymentExpirationInfo, false)}
        </Text>
      </ButtonDefaultOpacity>
    );
  }
}

export default PaymentButton;
