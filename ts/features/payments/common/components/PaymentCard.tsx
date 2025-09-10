import {
  BodySmall,
  H6,
  hexToRgba,
  IOColors,
  IOSkeleton,
  Tag,
  useIOTheme,
  useIOThemeContext,
  VStack,
  WithTestID
} from "@pagopa/io-app-design-system";
import { format } from "date-fns";
import { capitalize } from "lodash";
import { StyleSheet, View } from "react-native";
import I18n from "i18next";
import BPayLogo from "../../../../../img/wallet/payment-methods/bpay_logo_full.svg";
import PayPalLogo from "../../../../../img/wallet/payment-methods/paypal/paypal_logo_ext.svg";
import { LogoPaymentWithFallback } from "../../../../components/ui/utils/components/LogoPaymentWithFallback";

export type PaymentCardProps = {
  brand?: string;
  hpan?: string;
  expireDate?: Date;
  holderName?: string;
  holderPhone?: string;
  holderEmail?: string;
  isExpired?: boolean;
};

export type PaymentCardComponentProps = WithTestID<
  | ({
      isLoading?: false;
    } & PaymentCardProps)
  | {
      isLoading: true;
    }
>;

const usePaymentCardStyles = () => {
  const theme = useIOTheme();
  const { themeType } = useIOThemeContext();

  const isDarkMode = themeType === "dark";

  const textColor = theme["textHeading-default"];
  const backgroundColor = IOColors[theme["appBackground-tertiary"]];
  const borderColor = isDarkMode ? IOColors.black : IOColors["grey-200"];
  const errorBorderColor = IOColors[theme.errorText];

  const skeletonColor = isDarkMode
    ? hexToRgba(IOColors["grey-450"], 0.5)
    : IOColors["grey-200"];

  return {
    textColor,
    backgroundColor,
    borderColor,
    errorBorderColor,
    skeletonColor
  };
};

const PaymentCard = (props: PaymentCardComponentProps) => {
  const { textColor, backgroundColor, borderColor, errorBorderColor } =
    usePaymentCardStyles();

  if (props.isLoading) {
    return <PaymentCardSkeleton />;
  }

  const cardIcon = props.brand && (
    <LogoPaymentWithFallback brand={props.brand} isExtended />
  );

  const holderNameText = props.holderName && (
    <BodySmall
      color={textColor}
      weight="Regular"
      accessibilityLabel={I18n.t("wallet.methodDetails.a11y.bpay.owner", {
        fullOwnerName: props.holderName
      })}
    >
      {props.holderName}
    </BodySmall>
  );

  const expireDateText = props.expireDate && (
    <BodySmall weight="Regular" color={textColor}>
      {I18n.t("wallet.creditCard.validUntil", {
        expDate: format(props.expireDate, "MM/YY")
      })}
    </BodySmall>
  );

  const maskedEmailText = props.holderEmail && (
    <BodySmall
      color={textColor}
      weight="Semibold"
      accessibilityLabel={I18n.t("wallet.methodDetails.a11y.paypal.owner", {
        email: props.holderEmail
      })}
    >
      {props.holderEmail}
    </BodySmall>
  );

  const maskedPhoneText = props.holderPhone && (
    <BodySmall
      color={textColor}
      weight="Semibold"
      accessibilityLabel={I18n.t("wallet.methodDetails.a11y.bpay.phone", {
        // we do this to make the screen reader read the number digit by digit,
        phoneNumber: props.holderPhone.split("").join(" ")
      })}
    >
      {props.holderPhone}
    </BodySmall>
  );

  const renderBankLogo = () => {
    if (props.holderEmail) {
      return (
        <View accessibilityLabel="PayPal">
          <PayPalLogo
            testID="paymentCardPayPalLogoTestId"
            height={48}
            width={113}
          />
        </View>
      );
    }

    if (props.holderPhone) {
      return (
        <BPayLogo
          testID="paymentCardBPayLogoTestId"
          accessible={true}
          accessibilityLabel="BANCOMAT Pay"
          height={48}
          width={136}
        />
      );
    }

    if (props.hpan) {
      const circuitName =
        props.brand || I18n.t("wallet.methodDetails.cardGeneric");

      return (
        <H6
          color={textColor}
          accessibilityLabel={I18n.t("wallet.methodDetails.a11y.credit.hpan", {
            circuit: circuitName,
            // we space the hpan to make the screen reader read it digit by digit
            spacedHpan: props.hpan.split("").join(" ")
          })}
          numberOfLines={1}
          ellipsizeMode="middle"
          style={{ flexShrink: 1 }}
        >
          {capitalize(circuitName)} •••• {props.hpan}
        </H6>
      );
    }

    return undefined;
  };

  const expiredTag = (
    <View testID={`${props.testID}-expired`}>
      <Tag
        forceLightMode
        variant="error"
        text={I18n.t("features.payments.methods.status.expired")}
      />
    </View>
  );

  return (
    <View
      style={[
        styles.card,
        { backgroundColor, borderColor },
        props.isExpired && {
          borderColor: errorBorderColor
        }
      ]}
    >
      <View style={styles.wrapper}>
        <View style={styles.paymentInfo}>
          {renderBankLogo()}
          {props.isExpired ? expiredTag : cardIcon}
        </View>
        <View style={styles.additionalInfo}>
          {holderNameText}
          {maskedEmailText}
          {maskedPhoneText}
          {expireDateText}
        </View>
      </View>
    </View>
  );
};

const PaymentCardSkeleton = () => {
  const { backgroundColor, borderColor, skeletonColor } =
    usePaymentCardStyles();

  return (
    <View style={[styles.card, { backgroundColor, borderColor }]}>
      <View style={styles.wrapper}>
        <View style={styles.paymentInfo}>
          <IOSkeleton
            color={skeletonColor}
            shape="rectangle"
            width={"60%"}
            height={24}
            radius={28}
          />
          <IOSkeleton
            color={skeletonColor}
            shape="rectangle"
            width={"20%"}
            height={24}
            radius={28}
          />
        </View>
        <VStack space={8}>
          <IOSkeleton
            color={skeletonColor}
            shape="rectangle"
            width={"55%"}
            height={16}
            radius={28}
          />
          <IOSkeleton
            color={skeletonColor}
            shape="rectangle"
            width={"45%"}
            height={16}
            radius={28}
          />
        </VStack>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    paddingTop: 8,
    aspectRatio: 16 / 10,
    borderRadius: 8,
    borderWidth: 2,
    borderCurve: "continuous"
  },
  wrapper: {
    flex: 1,
    justifyContent: "space-between"
  },
  paymentInfo: {
    height: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  additionalInfo: {
    justifyContent: "space-between"
  }
});

export { PaymentCard };
