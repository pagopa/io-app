import {
  H6,
  IOColors,
  LabelSmallAlt,
  VSpacer,
  WithTestID
} from "@pagopa/io-app-design-system";
import { format } from "date-fns";
import { capitalize } from "lodash";
import React from "react";
import { StyleSheet, View } from "react-native";
import Placeholder, { BoxProps } from "rn-placeholder";
import BPayLogo from "../../../../../img/wallet/payment-methods/bpay_logo_full.svg";
import PayPalLogo from "../../../../../img/wallet/payment-methods/paypal/paypal_logo_ext.svg";
import { LogoPaymentWithFallback } from "../../../../components/ui/utils/components/LogoPaymentWithFallback";
import I18n from "../../../../i18n";
import { PaymentCardBankLogo } from "./PaymentCardBankLogo";

export type PaymentCardProps = {
  brand?: string;
  abiCode?: string;
  hpan?: string;
  expireDate?: Date;
  holderName?: string;
  holderPhone?: string;
  holderEmail?: string;
};

type Props =
  | ({
      isLoading?: false;
    } & PaymentCardProps)
  | {
      isLoading: true;
    };

const PaymentCard = (props: WithTestID<Props>) => {
  if (props.isLoading) {
    return <PaymentCardSkeleton />;
  }

  const cardIcon = props.brand && (
    <LogoPaymentWithFallback brand={props.brand} isExtended />
  );

  const holderNameText = props.holderName && (
    <LabelSmallAlt
      accessibilityLabel={I18n.t("wallet.methodDetails.a11y.bpay.owner", {
        fullOwnerName: props.holderName
      })}
    >
      {props.holderName}
    </LabelSmallAlt>
  );

  const expireDateText = props.expireDate && (
    <LabelSmallAlt>
      {I18n.t("wallet.creditCard.validUntil", {
        expDate: format(props.expireDate, "MM/YY")
      })}
    </LabelSmallAlt>
  );

  const maskedEmailText = props.holderEmail && (
    <LabelSmallAlt
      accessibilityLabel={I18n.t("wallet.methodDetails.a11y.paypal.owner", {
        email: props.holderEmail
      })}
    >
      {props.holderEmail}
    </LabelSmallAlt>
  );

  const maskedPhoneText = props.holderPhone && (
    <LabelSmallAlt
      accessibilityLabel={I18n.t("wallet.methodDetails.a11y.bpay.phone", {
        // we do this to make the screen reader read the number digit by digit,
        phoneNumber: props.holderPhone.split("").join(" ")
      })}
    >
      {props.holderPhone}
    </LabelSmallAlt>
  );

  const renderBankLogo = () => {
    if (props.holderEmail) {
      return (
        <View style={styleSheet.bankInfo}>
          <PayPalLogo
            testID="paymentCardPayPalLogoTestId"
            accessible={true}
            accessibilityLabel="PayPal"
            height={32}
            width={113}
          />
        </View>
      );
    }

    if (props.holderPhone) {
      return (
        <View style={styleSheet.bankInfo}>
          <BPayLogo
            testID="paymentCardBPayLogoTestId"
            accessible={true}
            accessibilityLabel="BANCOMAT Pay"
            height={24}
            width={136}
          />
        </View>
      );
    }

    if (props.abiCode) {
      return (
        <View style={styleSheet.bankInfo}>
          <PaymentCardBankLogo
            testID="paymentCardBankLogoTestId"
            abiCode={props.abiCode}
            height={24}
          />
        </View>
      );
    }

    if (props.hpan) {
      const circuitName =
        props.brand || I18n.t("wallet.methodDetails.cardGeneric");

      return (
        <H6
          accessibilityLabel={I18n.t("wallet.methodDetails.a11y.credit.hpan", {
            circuit: circuitName,
            // we space the hpan to make the screen reader read it digit by digit
            spacedHpan: props.hpan.split("").join(" ")
          })}
          style={styleSheet.bankInfo}
        >
          {capitalize(circuitName)} •••• {props.hpan}
        </H6>
      );
    }

    return undefined;
  };

  return (
    <View style={styleSheet.card}>
      <View style={styleSheet.wrapper}>
        <View style={styleSheet.paymentInfo}>
          {renderBankLogo()}
          {cardIcon}
        </View>
        <View style={styleSheet.additionalInfo}>
          {holderNameText}
          {maskedEmailText}
          {maskedPhoneText}
          {expireDateText}
        </View>
      </View>
    </View>
  );
};

const PaymentCardSkeleton = () => (
  <View style={styleSheet.card}>
    <View style={styleSheet.wrapper}>
      <View style={[styleSheet.paymentInfo, { paddingTop: 8 }]}>
        <View style={{ width: "60%" }}>
          <SkeletonPlaceholder height={24} width={"100%"} />
        </View>
        <View style={{ width: "20%" }}>
          <SkeletonPlaceholder height={24} width={"100%"} />
        </View>
      </View>
      <View style={styleSheet.additionalInfo}>
        <SkeletonPlaceholder height={18} width={"55%"} />
        <VSpacer size={8} />
        <SkeletonPlaceholder height={18} width={"45%"} />
      </View>
    </View>
  </View>
);

const SkeletonPlaceholder = (props: Pick<BoxProps, "width" | "height">) => (
  <Placeholder.Box
    animate="fade"
    radius={28}
    color={IOColors["grey-200"]}
    {...props}
  />
);

const styleSheet = StyleSheet.create({
  card: {
    aspectRatio: 16 / 10,
    backgroundColor: IOColors["grey-100"],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: IOColors["grey-200"]
  },
  wrapper: {
    padding: 16,
    paddingTop: 8,
    flex: 1,
    justifyContent: "space-between"
  },
  bankInfo: {
    paddingTop: 12
  },
  paymentInfo: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  additionalInfo: {
    justifyContent: "space-between"
  }
});

export { PaymentCard };
