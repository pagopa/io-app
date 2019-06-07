import { Button, Text } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import React, { ComponentProps } from "react";

import I18n from "../../i18n";
import { formatPaymentAmount } from "../../utils/payment";
import IconFont from "../ui/IconFont";

type Props = {
  amount: number;
  paid: boolean;
  expiring: boolean;
  expired: boolean;
  small?: boolean;
  onPress: ComponentProps<typeof Button>["onPress"];
};

class PaymentButton extends React.PureComponent<Props> {
  private getButtonIcon = () => {
    const { paid, expired } = this.props;

    if (paid || expired) {
      return null;
    }

    return <IconFont name="io-timer" />;
  };

  private getButtonText = (): string => {
    const { amount, expired } = this.props;

    if (expired) {
      return I18n.t("messages.cta.payment.expired");
    }

    return I18n.t("messages.cta.pay", {
      amount: formatPaymentAmount(amount)
    });
  };

  public render() {
    const { small, onPress } = this.props;

    const buttonIcon = this.getButtonIcon();

    return (
      <Button block={true} xsmall={small} onPress={onPress}>
        {buttonIcon}
        <Text>{this.getButtonText()}</Text>
      </Button>
    );
  }
}

export default connectStyle(
  "UIComponent.PaymentButton",
  {},
  mapPropsToStyleNames
)(PaymentButton);
