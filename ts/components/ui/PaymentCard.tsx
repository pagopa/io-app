import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { StyleSheet, View } from "react-native";
import { WithTestID } from "../../types/WithTestID";
import { formatDateAsLocal } from "../../utils/dates";
import { IOIconSizeScale, Icon } from "../core/icons";
import { IOLogoPaymentType, LogoPayment } from "../core/logos";
import { VSpacer } from "../core/spacer/Spacer";
import { LabelSmall } from "../core/typography/LabelSmall";
import { NewH6 } from "../core/typography/NewH6";
import { IOColors } from "../core/variables/IOColors";
import { IOBannerRadius } from "../core/variables/IOShapes";
import { IOStyles } from "../core/variables/IOStyles";

const smallCardStyles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    alignItems: "flex-start",
    alignContent: "center",
    justifyContent: "center",
    width: 145,
    flexBasis: 145,
    flexGrow: 0,
    // backgroundColor: IOColors["grey-100"],
    borderRadius: IOBannerRadius,
    padding: 16
  },
  logoRow: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
});
const bigCardStyles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    alignItems: "flex-start",
    alignContent: "space-between",
    justifyContent: "space-between",
    height: 207,
    borderRadius: IOBannerRadius,
    backgroundColor: IOColors["grey-100"],
    padding: 24
  },
  bottomRow: {
    // flex: 1,
    height: 48,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
  // topRow: {
  //   // flex: 1,
  //   // height: 48,
  //   width: "100%",
  //   flexDirection: "row",
  //   alignItems: "flex-end",
  //   justifyContent: "space-between"
  // }
});

type PAYMENT_METHOD_CARD_TYPES = {
  CREDIT: "CREDIT";
  PAGOBANCOMAT: "PAGOBANCOMAT";
  PAYPAL: "PAYPAL";
  COBADGE: "COBADGE";
  BANCOMATPAY: "BANCOMATPAY";
};

// all cards have an expiration date except for paypal,
// bancomatPay also has a phone number
// the rendering of the circuit logo is handled by the component

type BigPaymentCardProps = GeneralPaymentCardProps &
  (
    | {
        cardType: PAYMENT_METHOD_CARD_TYPES["PAYPAL"];
        holderEmail: string;
      }
    | {
        cardType: PAYMENT_METHOD_CARD_TYPES["BANCOMATPAY"];
        phoneNumber: string;
        expirationDate: Date;
        holderName: string;
      }
    | {
        cardType:
          | PAYMENT_METHOD_CARD_TYPES["PAGOBANCOMAT"]
          | PAYMENT_METHOD_CARD_TYPES["COBADGE"];
        expirationDate: Date;
        abiCode: string;
        holderName: string;
      }
    | {
        cardType: PAYMENT_METHOD_CARD_TYPES["CREDIT"];
        expirationDate: Date;
        holderName: string;
      }
  );
type SmallPaymentCardProps = GeneralPaymentCardProps & {
  isError?: boolean;
};
type GeneralPaymentCardProps = {
  hpan: string;
  cardIcon?: IOLogoPaymentType;
};
export type PaymentCardProps = WithTestID<
  | ({
      size: "big";
    } & BigPaymentCardProps)
  | ({
      size: "small";
    } & SmallPaymentCardProps)
>;

export const PaymentCard = (props: PaymentCardProps) => {
  // const { onPressIn, onPressOut, animatedScaleStyle } =
  //   useListItemSpringAnimation();
  const { size } = props;
  if (size === "small") {
    return <SmallPaymentCard {...props} />;
  }
  return <BigPaymentCard {...props} />;
};

const SmallPaymentCard = ({
  isError,
  hpan,
  cardIcon
}: SmallPaymentCardProps) => {
  const containerStyle = {
    ...smallCardStyles.cardContainer,
    backgroundColor: isError ? IOColors["error-100"] : IOColors["grey-100"]
  };

  return (
    <View style={containerStyle}>
      <View style={smallCardStyles.logoRow}>
        <LogoPaymentOrDefaultIcon cardIcon={cardIcon} size={24} />
        {isError && <Icon name="errorFilled" size={18} color="error-850" />}
      </View>
      <VSpacer size={8} />
      <NewH6>•••• {hpan}</NewH6>
    </View>
  );
};

const BigPaymentCard = (props: BigPaymentCardProps) => (
  <View style={bigCardStyles.cardContainer}>
    <BigPaymentCardTopSection {...props} />
    <VSpacer size={8} />
    <BigPaymentCardBottomSection {...props} />
  </View>
);

const BigPaymentCardBottomSection = (props: BigPaymentCardProps) => {
  switch (props.cardType) {
    case "PAYPAL":
      return <NewH6>{props.holderEmail}</NewH6>;
    case "BANCOMATPAY":
      return (
        <View style={IOStyles.column}>
          <LabelSmall color="grey-650" weight="Regular">
            {props.phoneNumber}
          </LabelSmall>
          <NewH6>{props.holderName}</NewH6>
        </View>
      );
    case "PAGOBANCOMAT":
      return (
        <View style={bigCardStyles.bottomRow}>
          <NewH6>{props.holderName}</NewH6>
          <LogoPayment name={"pagoBancomat"} size={48} />
        </View>
      );
    default:
      return (
        <View style={bigCardStyles.bottomRow}>
          <NewH6>{props.holderName}</NewH6>
          <LogoPaymentOrDefaultIcon cardIcon={props.cardIcon} size={48} />
        </View>
      );
  }
};

const BigPaymentCardTopSection = (props: BigPaymentCardProps) => {
  switch (props.cardType) {
    case "PAYPAL":
      return <NewH6>PAYPAL</NewH6>;
    case "PAGOBANCOMAT":
    case "COBADGE":
      return (
        <View style={IOStyles.flex}>
          <NewH6>{props.cardType}</NewH6>

          <LabelSmall color="grey-650" weight="Regular">
            {`VALID UNTIL ${formatDateAsLocal(props.expirationDate, true)}`}
          </LabelSmall>
        </View>
      );
    case "CREDIT":
      return (
        <View style={IOStyles.flex}>
          <NewH6 style={{ textTransform: "capitalize" }}>
            {`${props.cardIcon} ${props.hpan}`}
          </NewH6>

          <LabelSmall color="grey-650" weight="Regular">
            {`VALID UNTIL ${formatDateAsLocal(props.expirationDate, true)}`}
          </LabelSmall>
        </View>
      );
    case "BANCOMATPAY":
      return (
        <View style={IOStyles.flex}>
          <NewH6 style={{ textTransform: "capitalize" }}>
            {props.cardType}
          </NewH6>

          <LabelSmall color="grey-650" weight="Regular">
            {`VALID UNTIL ${formatDateAsLocal(props.expirationDate, true)}`}
          </LabelSmall>
        </View>
      );
  }
};

const LogoPaymentOrDefaultIcon = ({
  cardIcon,
  size
}: {
  cardIcon?: IOLogoPaymentType;
  size: IOIconSizeScale;
}) =>
  pipe(
    cardIcon,
    O.fromNullable,
    O.fold(
      // would be a cleaner solution to create an io-ts type and decode
      () => <Icon name="creditCard" size={size} color="grey-700" />,
      icon => <LogoPayment name={icon} size={size} />
    )
  );
