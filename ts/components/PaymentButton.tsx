import { Button, Text } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";

import { PaymentExpiration } from "./messages/MessageCTABarComponent";
import IconFont from "./ui/IconFont";

type Props = {
  amount: number;
  paymentExpiration: PaymentExpiration;
};

type ButtonData = {
  [id in PaymentExpiration["kind"]]: {
    text: (amount: number) => string;
    buttonBgColor?: string;
    iconName?: string;
  }
};

const styles = StyleSheet.create({
  text: {
    paddingLeft: 0,
    paddingRight: 0
  },
  icon: {
    marginRight: 8
  }
});

const BUTTON_DATA: ButtonData = {
  UNEXPIRABLE: {
    text: amount => `Paga € ${amount}`
  },
  EXPIRED: {
    text: () => `Scaduto`
  },
  EXPIRING: {
    text: amount => `Paga € ${amount}`,
    iconName: "io-timer"
  },
  VALID: {
    text: amount => `Paga € ${amount}`
  }
};

const PaymentButton: React.FC<Props> = ({ amount, paymentExpiration }) => {
  const { text, iconName } = BUTTON_DATA[paymentExpiration.kind];

  return (
    <Button block={true} xsmall={true}>
      {iconName && <IconFont name={iconName} style={styles.icon} />}
      <Text style={styles.text}>{text(amount)}</Text>
    </Button>
  );
};

export default React.memo(PaymentButton);
