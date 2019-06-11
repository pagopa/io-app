import { Button, Text } from "native-base";
import React, { ComponentProps } from "react";
import { StyleSheet } from "react-native";

import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import { MessagePaymentExpirationInfo } from "../../utils/messages";
import { formatPaymentAmount } from "../../utils/payment";
import IconFont from "../ui/IconFont";

type Props = {
  paid: boolean;
  messagePaymentExpirationInfo: MessagePaymentExpirationInfo;
  small?: boolean;
  disabled?: boolean;
  onPress: ComponentProps<typeof Button>["onPress"];
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

const expiringStyles = StyleSheet.create({
  button: {
    backgroundColor: "#D0021B"
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
    backgroundColor: "#b5b5b5"
  },

  icon: {
    color: customVariables.colorWhite
  },

  text: {
    color: customVariables.colorWhite
  }
});

const getExpirationStyles = (
  messagePaymentExpirationInfo: MessagePaymentExpirationInfo,
  small: boolean = false
) => {
  if (messagePaymentExpirationInfo.kind === "UNEXPIRABLE") {
    return unexpirableStyles;
  }

  switch (messagePaymentExpirationInfo.expireStatus) {
    case "VALID":
      return validStyles;
    case "EXPIRING":
      return small ? expiringStyles : validStyles;

    default:
      return expiredStyles;
  }
};

const getButtonText = (
  messagePaymentExpirationInfo: MessagePaymentExpirationInfo
): string => {
  const { amount } = messagePaymentExpirationInfo;

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
  public render() {
    const {
      paid,
      messagePaymentExpirationInfo,
      small,
      disabled,
      onPress
    } = this.props;

    const appliedStyles = getExpirationStyles(
      messagePaymentExpirationInfo,
      small
    );

    const isUnexpirable = messagePaymentExpirationInfo.kind === "UNEXPIRABLE";
    const isExpired =
      messagePaymentExpirationInfo.kind === "EXPIRABLE" &&
      messagePaymentExpirationInfo.expireStatus === "EXPIRED";
    const hideIcon = paid || isUnexpirable || isExpired || !small;

    return (
      <Button
        disabled={disabled}
        onPress={onPress}
        style={[
          baseStyles.button,
          appliedStyles.button,
          small && smallStyles.button,
          disabled && disabledStyles.button
        ]}
      >
        {!hideIcon && (
          <IconFont
            name="io-timer"
            style={[
              baseStyles.icon,
              appliedStyles.icon,
              small && smallStyles.icon,
              disabled && disabledStyles.icon
            ]}
          />
        )}
        <Text
          style={[
            baseStyles.text,
            appliedStyles.text,
            small && smallStyles.text,
            disabled && disabledStyles.text
          ]}
        >
          {getButtonText(messagePaymentExpirationInfo)}
        </Text>
      </Button>
    );
  }
}

export default PaymentButton;
