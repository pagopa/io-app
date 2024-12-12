import {
  H3,
  H6,
  IOColors,
  IOLogoPaymentExtType,
  IOStyles,
  BodySmall,
  LogoPaymentExt,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import { LogoPaymentExtended } from "../../../../components/ui/LogoPaymentExtended";
import I18n from "../../../../i18n";
import { WithTestID } from "../../../../types/WithTestID";
import { format } from "../../../../utils/dates";
import { capitalize } from "../../../../utils/strings";
import { LogoPaymentWithFallback } from "../../../../components/ui/utils/components/LogoPaymentWithFallback";

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
      return (
        <BottomSectionText
          a11yLabel={I18n.t("wallet.methodDetails.a11y.paypal.owner", {
            email: props.holderEmail
          })}
          string={props.holderEmail}
        />
      );
    case "BANCOMATPAY":
      return (
        <View style={IOStyles.column}>
          <BodySmall
            accessibilityLabel={I18n.t("wallet.methodDetails.a11y.bpay.phone", {
              // we do this to make the screen reader read the number digit by digit,
              phoneNumber: props.phoneNumber.split("").join(" ")
            })}
            color="grey-650"
            weight="Regular"
          >
            {props.phoneNumber}
          </BodySmall>
          <VSpacer size={8} />
          <BottomSectionText
            a11yLabel={I18n.t("wallet.methodDetails.a11y.bpay.owner", {
              fullOwnerName: props.holderName
            })}
            string={props.holderName}
          />
        </View>
      );
    case "PAGOBANCOMAT":
      return (
        <View style={styles.bottomRow}>
          <BottomSectionText
            a11yLabel={I18n.t("wallet.methodDetails.a11y.bancomat.owner", {
              fullOwnerName: props.holderName
            })}
            string={props.holderName}
          />
          <LogoPaymentExt name="pagoBancomat" size={48} />
        </View>
      );
    case "COBADGE":
      return (
        <View style={styles.bottomRow}>
          <BottomSectionText
            a11yLabel={I18n.t("wallet.methodDetails.a11y.cobadge.owner", {
              fullOwnerName: props.holderName
            })}
            string={props.holderName}
          />
          <LogoPaymentWithFallback isExtended brand={props.cardIcon} />
        </View>
      );
    case "CREDIT":
      return (
        <View style={styles.bottomRow}>
          <BottomSectionText
            a11yLabel={I18n.t("wallet.methodDetails.a11y.credit.owner", {
              fullOwnerName: props.holderName
            })}
            string={props.holderName}
          />
          <LogoPaymentWithFallback isExtended brand={props.cardIcon} />
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
      return (
        <View style={IOStyles.flex}>
          <LogoPaymentExtended
            dimensions={{ width: BANK_LOGO_WIDTH, height: LOGO_HEIGHT }}
            abiCode={props.abiCode}
            imageA11yLabel={I18n.t("wallet.methodDetails.a11y.bancomat.bank", {
              bankName: props.bankName
            })}
          />
          <ExpDateComponent expDate={props.expirationDate} />
        </View>
      );
    case "COBADGE":
      return (
        <View style={IOStyles.flex}>
          <LogoPaymentExtended
            dimensions={{ width: BANK_LOGO_WIDTH, height: LOGO_HEIGHT }}
            abiCode={props.abiCode}
            imageA11yLabel={I18n.t("wallet.methodDetails.a11y.cobadge.bank", {
              bankName: props.bankName ?? " "
            })}
          />
          <ExpDateComponent expDate={props.expirationDate} />
        </View>
      );
    case "CREDIT":
      return (
        <View style={IOStyles.flex}>
          <H3
            accessibilityLabel={I18n.t(
              "wallet.methodDetails.a11y.credit.hpan",
              {
                circuit: capitalize(
                  props.cardIcon || I18n.t("wallet.methodDetails.cardGeneric")
                ),
                // we space the hpan to make the screen reader read it digit by digit
                spacedHpan: props.hpan.split("").join(" ")
              }
            )}
            style={{ textTransform: "capitalize" }}
          >
            {`${props.cardIcon} ••${props.hpan}`}
          </H3>
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
        </View>
      );
  }
};

// ------------- utils
const BottomSectionText = (props: { string: string; a11yLabel: string }) => (
  <H6
    accessible
    accessibilityLabel={props.a11yLabel}
    numberOfLines={1}
    style={{ width: "75%" }}
    ellipsizeMode="tail"
  >
    {props.string}
  </H6>
);
const ExpDateComponent = ({ expDate }: { expDate?: Date }) => {
  if (expDate) {
    return (
      <>
        <VSpacer size={8} />
        <BodySmall color="grey-650" weight="Regular">
          {I18n.t("wallet.creditCard.validUntil", {
            expDate: format(expDate, "MM/YY")
          })}
        </BodySmall>
      </>
    );
  }

  return null;
};

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

// all cards have an expiration date except for paypal and bpay,
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
      holderName: string;
    }
  | {
      cardType: "PAGOBANCOMAT";
      expirationDate?: Date;
      abiCode?: string;
      holderName: string;
      bankName?: string;
    }
  | {
      cardType: "COBADGE";
      expirationDate?: Date;
      abiCode?: string;
      bankName?: string;
      holderName: string;
      cardIcon?: IOLogoPaymentExtType;
    }
  | {
      cardType: "CREDIT";
      expirationDate?: Date;
      holderName: string;
      hpan: string;
      cardIcon?: IOLogoPaymentExtType;
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
    borderCurve: "continuous",
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
