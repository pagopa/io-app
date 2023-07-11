import React from "react";
import { Image, StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
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
import I18n from "../../../../i18n";
import paypalLogoImage from "../../../../../img/wallet/payment-methods/paypal-logo.png";
import BpayLogo from "../../../../../img/wallet/payment-methods/bpay_logo_full.svg";

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
  },
  paypalLogoExt: {
    width: 132,
    height: 33,
    resizeMode: "contain"
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

export type PaymentCardBigProps = WithTestID<
  | { isLoading: true; accessibilityLabel?: string }
  | ({
      isLoading?: false;
      accessibilityLabel?: string;
    } & PaymentCardStandardProps)
>;

type PaymentCardStandardProps =
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
    };
export const PaymentCardBig = (props: PaymentCardBigProps) => {
  if (props.isLoading) {
    return <CardSkeleton testID={props.testID} />;
  }
  return (
    <View testID={props.testID} style={styles.cardContainer}>
      <BigPaymentCardTopSection {...props} />
      <VSpacer size={8} />
      <BigPaymentCardBottomSection {...props} />
    </View>
  );
};

const CardSkeleton = ({ testID }: { testID?: string }) => (
  <View testID={`${testID}-skeleton`} style={styles.cardContainer}>
    <View>
      <Placeholder.Box
        color={IOColors["grey-200"]}
        animate="fade"
        radius={8}
        width={164}
        height={24}
      />
      <VSpacer size={16} />
      <Placeholder.Box
        color={IOColors["grey-200"]}
        animate="fade"
        radius={8}
        width={117}
        height={16}
      />
    </View>
    <View>
      <Placeholder.Box
        color={IOColors["grey-200"]}
        animate="fade"
        radius={8}
        width={97}
        height={16}
      />
      <VSpacer size={4} />
      <Placeholder.Box
        color={IOColors["grey-200"]}
        animate="fade"
        radius={8}
        width={164}
        height={24}
      />
    </View>
  </View>
);

const BottomSectionText = (props: { string: string }) => (
  <NewH6 numberOfLines={1} style={{ width: "75%" }} ellipsizeMode="tail">
    {props.string}
  </NewH6>
);
const BigPaymentCardBottomSection = (props: PaymentCardStandardProps) => {
  switch (props.cardType) {
    case "PAYPAL":
      return <BottomSectionText string={props.holderEmail} />;
    case "BANCOMATPAY":
      return (
        <View style={IOStyles.column}>
          <LabelSmall color="grey-650" weight="Regular">
            {props.phoneNumber}
          </LabelSmall>
          <BottomSectionText string={props.holderName} />
        </View>
      );
    case "PAGOBANCOMAT":
      return (
        <View style={styles.bottomRow}>
          <BottomSectionText string={props.holderName} />
          <LogoPayment name={"pagoBancomat"} size={48} />
        </View>
      );
    default:
      return (
        <View style={styles.bottomRow}>
          <BottomSectionText string={props.holderName} />
          <LogoPaymentOrDefaultIcon cardIcon={props.cardIcon} size={48} />
        </View>
      );
  }
};

const BigPaymentCardTopSection = (props: PaymentCardStandardProps) => {
  const getCdnPath = (abi: string) =>
    `https://assets.cdn.io.italia.it/logos/abi/${abi}.png`;
  switch (props.cardType) {
    case "PAYPAL":
      return <Image source={paypalLogoImage} style={styles.paypalLogoExt} />;
    case "PAGOBANCOMAT":
    case "COBADGE":
      return (
        <View style={IOStyles.flex}>
          <NewH6>{props.cardType}</NewH6>

          <LabelSmall color="grey-650" weight="Regular">
            {I18n.t("wallet.creditCard.validUntil", {
              expDate: formatDateAsLocal(props.expirationDate, true)
            })}
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
            {I18n.t("wallet.creditCard.validUntil", {
              expDate: formatDateAsLocal(props.expirationDate, true)
            })}
          </LabelSmall>
        </View>
      );
    case "BANCOMATPAY":
      return (
        <View style={IOStyles.flex}>
          <BpayLogo width={133} height={33} />
          <LabelSmall color="grey-650" weight="Regular">
            {I18n.t("wallet.creditCard.validUntil", {
              expDate: formatDateAsLocal(props.expirationDate, true)
            })}
          </LabelSmall>
        </View>
      );
  }
};
