import { Button, Text, View } from "native-base";
import React from "react";

import { CreatedMessageWithContent } from "../../../definitions/backend/CreatedMessageWithContent";
import I18n from "../../i18n";
import { PaidReason } from "../../store/reducers/entities/payments";
import { formatPaymentAmount } from "../../utils/payment";
import IconFont from "../ui/IconFont";

type OwnProps = {
  message: CreatedMessageWithContent;
  payment?: PaidReason;
  small?: boolean;
};
type Props = OwnProps;

type PaymentUnexpirable = {
  expiration: "UNEXPIRABLE";
};

type PaymentValid = {
  expiration: "VALID";
  expireDate: Date;
};

type PaymentExpiring = {
  expiration: "EXPIRING";
  expireDate: Date;
};

type PaymentExpired = {
  expiration: "EXPIRED";
  expireDate: Date;
};

export type PaymentExpiration =
  | PaymentUnexpirable
  | PaymentValid
  | PaymentExpiring
  | PaymentExpired;

type PaymentPaid = {
  paid: true;
};

type PaymentUnpaid = {
  paid: false;
} & PaymentExpiration;

type PaymentStatus = PaymentPaid | PaymentUnpaid;

const getPaymentExpiration = (
  paymentData: NonNullable<
    CreatedMessageWithContent["content"]["payment_data"]
  >,
  dueDate?: Date
): PaymentExpiration => {
  if (paymentData.invalid_after_due_date && dueDate !== undefined) {
    const remainingMilliseconds = dueDate.getTime() - Date.now();
    if (remainingMilliseconds < 0) {
      // EXPIRED
      return {
        expiration: "EXPIRED",
        expireDate: dueDate
      };
    }
    if (remainingMilliseconds < 1000 * 60 * 60 * 24) {
      // EXPIRING
      return {
        expiration: "EXPIRING",
        expireDate: dueDate
      };
    }

    return {
      expiration: "VALID",
      expireDate: dueDate
    };
  }

  return {
    expiration: "UNEXPIRABLE"
  };
};

const getPaymentButton = (
  paymentData: CreatedMessageWithContent["content"]["payment_data"],
  isPaid: boolean,
  dueDate?: Date
) => {
  if (paymentData !== undefined) {
    const paymentStatus: PaymentStatus = isPaid
      ? {
          paid: true
        }
      : {
          paid: false,
          ...getPaymentExpiration(paymentData, dueDate)
        };

    if (paymentStatus.paid) {
      return (
        <Button block={true} xsmall={true} light={true} bordered={true}>
          <IconFont name="io-tick-big" />
          <Text>
            {I18n.t("messages.cta.paid", {
              amount: formatPaymentAmount(paymentData.amount)
            })}
          </Text>
        </Button>
      );
    } else {
      if (
        paymentStatus.expiration === "UNEXPIRABLE" ||
        paymentStatus.expiration === "VALID"
      ) {
        return (
          <Button block={true} xsmall={true} primary={true}>
            <Text>
              {I18n.t("messages.cta.pay", {
                amount: formatPaymentAmount(paymentData.amount)
              })}
            </Text>
          </Button>
        );
      }

      if (paymentStatus.expiration === "EXPIRING") {
        return (
          <Button block={true} xsmall={true} danger={true}>
            <IconFont name="io-timer" size={20} />
            <Text>
              {I18n.t("messages.cta.pay", {
                amount: formatPaymentAmount(paymentData.amount)
              })}
            </Text>
          </Button>
        );
      }

      return (
        <Button block={true} xsmall={true} dark={true}>
          <Text>
            {I18n.t("messages.cta.payment.expired", {
              amount: formatPaymentAmount(paymentData.amount)
            })}
          </Text>
        </Button>
      );
    }
  }

  return null;
};

class MessageCTABarComponent extends React.PureComponent<Props> {
  public render() {
    const { message, payment } = this.props;
    const { payment_data, due_date } = message.content;

    const isPaid = payment !== undefined;
    const paymentButton = getPaymentButton(payment_data, isPaid, due_date);

    return <View>{paymentButton}</View>;
  }
}

export default MessageCTABarComponent;
