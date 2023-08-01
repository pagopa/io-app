import { format } from "date-fns";
import React from "react";
import { StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import I18n from "../../../../i18n";
import { WithTestID } from "../../../../types/WithTestID";
import { IOLogoPaymentType, LogoPayment } from "../../../core/logos";
import { VSpacer } from "../../../core/spacer/Spacer";
import { LabelSmall } from "../../../core/typography/LabelSmall";
import { NewH6 } from "../../../core/typography/NewH6";
import { IOColors } from "../../../core/variables/IOColors";
import { IOStyles } from "../../../core/variables/IOStyles";
import { LogoPaymentExtended } from "../../LogoPaymentExtended";
import { LogoPaymentOrDefaultIcon } from "../../utils/baseComponents/LogoPaymentOrDefaultIcon";

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
// ------------- core
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
  switch (props.cardType) {
    case "PAYPAL":
      return (
        <LogoPaymentExtended
          dimensions={{ width: PAYPAL_LOGO_WIDTH, height: LOGO_HEIGHT }}
          icon="payPal"
        />
      );
    case "PAGOBANCOMAT":
    case "COBADGE":
      return (
        <View style={IOStyles.flex}>
          <LogoPaymentExtended
            dimensions={{ width: BANK_LOGO_WIDTH, height: LOGO_HEIGHT }}
            abiCode={props.abiCode}
          />
          <ExpDateComponent expDate={props.expirationDate} />
        </View>
      );
    case "CREDIT":
      return (
        <View style={IOStyles.flex}>
          <NewH6 style={{ textTransform: "capitalize" }}>
            {`${props.cardIcon} •• ${props.hpan}`}
          </NewH6>
          <ExpDateComponent expDate={props.expirationDate} />
        </View>
      );
    case "BANCOMATPAY":
      return (
        <View style={IOStyles.flex}>
          <LogoPaymentExtended
            dimensions={{ width: BPAY_LOGO_WIDTH, height: LOGO_HEIGHT }}
            icon="bpay"
          />
          <ExpDateComponent expDate={props.expirationDate} />
        </View>
      );
  }
};

// ------------- utils
const BottomSectionText = (props: { string: string }) => (
  <NewH6 numberOfLines={1} style={{ width: "75%" }} ellipsizeMode="tail">
    {props.string}
  </NewH6>
);
const ExpDateComponent = ({ expDate }: { expDate: Date }) => (
  <>
    <VSpacer size={8} />
    <LabelSmall color="grey-650" weight="Regular">
      {I18n.t("wallet.creditCard.validUntil", {
        expDate: format(expDate, "MM/YY")
      })}
    </LabelSmall>
  </>
);

// ------------- skeleton
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

// ------------- styles + types

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
      cardType: "PAYPAL";
      holderEmail: string;
    }
  | {
      cardType: "BANCOMATPAY";
      phoneNumber: string;
      expirationDate: Date;
      holderName: string;
    }
  | {
      cardType: "PAGOBANCOMAT";
      expirationDate: Date;
      abiCode: string;
      holderName: string;
    }
  | {
      cardType: "COBADGE";
      expirationDate: Date;
      abiCode: string;
      holderName: string;
      cardIcon?: IOLogoPaymentType;
    }
  | {
      cardType: "CREDIT";
      expirationDate: Date;
      holderName: string;
      hpan: string;
      cardIcon?: IOLogoPaymentType;
    };

const LOGO_HEIGHT = 32;
const BANK_LOGO_WIDTH = 213;
const BPAY_LOGO_WIDTH = 170;
const PAYPAL_LOGO_WIDTH = 114;
const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    alignItems: "flex-start",
    alignContent: "space-between",
    justifyContent: "space-between",
    height: 207,
    borderRadius: 16,
    backgroundColor: IOColors["grey-100"],
    padding: 24,
    width: "100%" // required for consistent skeleton sizing
  },
  bottomRow: {
    height: 48,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
});
