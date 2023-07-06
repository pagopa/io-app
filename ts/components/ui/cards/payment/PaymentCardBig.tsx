import React from "react";
import { StyleSheet, View } from "react-native";
import { WithTestID } from "../../../../types/WithTestID";
import { formatDateAsLocal } from "../../../../utils/dates";
import { IOLogoPaymentType, LogoPayment } from "../../../core/logos";
import { VSpacer } from "../../../core/spacer/Spacer";
import { LabelSmall } from "../../../core/typography/LabelSmall";
import { NewH6 } from "../../../core/typography/NewH6";
import { IOColors } from "../../../core/variables/IOColors";
import { IOBannerRadius } from "../../../core/variables/IOShapes";
import { IOStyles } from "../../../core/variables/IOStyles";
import { LogoPaymentOrDefaultIcon } from "../../baseComponents/LogoPaymentOrDefaultIcon";

const styles = StyleSheet.create({
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
    height: 48,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
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

type BigPaymentCardProps = WithTestID<{
  accessibilityLabel?: string;
}> &
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
        cardType: PAYMENT_METHOD_CARD_TYPES["PAGOBANCOMAT"];
        expirationDate: Date;
        abiCode: string;
        holderName: string;
      }
    | {
        cardType: PAYMENT_METHOD_CARD_TYPES["COBADGE"];
        expirationDate: Date;
        abiCode: string;
        holderName: string;
        cardIcon?: IOLogoPaymentType;
      }
    | {
        cardType: PAYMENT_METHOD_CARD_TYPES["CREDIT"];
        expirationDate: Date;
        holderName: string;
        hpan: string;
        cardIcon?: IOLogoPaymentType;
      }
  );
export const PaymentCardBig = (props: BigPaymentCardProps) => (
  <View testID={props.testID} style={styles.cardContainer}>
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
        <View style={styles.bottomRow}>
          <NewH6>{props.holderName}</NewH6>
          <LogoPayment name={"pagoBancomat"} size={48} />
        </View>
      );
    default:
      return (
        <View style={styles.bottomRow}>
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
