import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { WithTestID } from "../../types/WithTestID";
import { formatDateAsLocal } from "../../utils/dates";
import { Icon } from "../core/icons";
import { IOLogoPaymentType, LogoPayment } from "../core/logos";
import { VSpacer } from "../core/spacer/Spacer";
import { LabelSmall } from "../core/typography/LabelSmall";
import { NewH6 } from "../core/typography/NewH6";
import { IOColors } from "../core/variables/IOColors";
import { IOBannerRadius } from "../core/variables/IOShapes";
import { IOStyles } from "../core/variables/IOStyles";
import { LogoPaymentOrDefaultIcon } from "./baseComponents/LogoPaymentOrDefaultIcon";
import { useListItemSpringAnimation } from "./hooks/useListItemSpringAnimation";

const smallCardStyles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    alignItems: "flex-start",
    alignContent: "center",
    justifyContent: "center",
    width: 145,
    flexBasis: 145,
    flexGrow: 0,
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
type GeneralPaymentCardProps = WithTestID<{
  hpan: string;
  cardIcon?: IOLogoPaymentType;
}>;
export type PaymentCardProps = WithTestID<
  {
    onCardPress?: () => void;
    accessibilityLabel?: string;
  } & (
    | ({
        size: "big";
      } & BigPaymentCardProps)
    | ({
        size: "small";
      } & SmallPaymentCardProps)
  )
>;

export const PaymentCard = (props: PaymentCardProps) => {
  const { size, onCardPress, testID, accessibilityLabel } = props;

  const Content = () =>
    size === "small" ? (
      <SmallPaymentCard {...props} />
    ) : (
      <BigPaymentCard {...props} />
    );

  return onCardPress !== undefined ? (
    <PressableBase
      testID={`${testID}-pressable`}
      accessibilityLabel={accessibilityLabel}
      onCardPress={onCardPress}
    >
      <Content />
    </PressableBase>
  ) : (
    <Content />
  );
};

const SmallPaymentCard = ({
  isError,
  hpan,
  cardIcon,
  testID
}: SmallPaymentCardProps) => {
  const textColor = isError ? "error-850" : "grey-700";
  const containerStyle = {
    ...smallCardStyles.cardContainer,
    backgroundColor: isError ? IOColors["error-100"] : IOColors["grey-100"]
  };

  return (
    <View style={containerStyle} testID={testID}>
      <View style={smallCardStyles.logoRow}>
        <LogoPaymentOrDefaultIcon
          cardIcon={cardIcon}
          size={24}
          fallbackIconColor={textColor}
        />

        {isError && <Icon name="errorFilled" size={18} color="error-850" />}
      </View>
      <VSpacer size={8} />
      <NewH6 color={textColor}>•••• {hpan}</NewH6>
    </View>
  );
};

const BigPaymentCard = (props: BigPaymentCardProps) => (
  <View testID={props.testID} style={bigCardStyles.cardContainer}>
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
const PressableBase = (
  props: React.PropsWithChildren<
    WithTestID<{
      onCardPress: () => void;
      accessibilityLabel?: string;
    }>
  >
) => {
  const { onPressIn, onPressOut, animatedScaleStyle } =
    useListItemSpringAnimation();
  const { onCardPress, testID, accessibilityLabel, children } = props;
  return (
    <Pressable
      onPress={onCardPress}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
    >
      <Animated.View style={animatedScaleStyle}>{children}</Animated.View>
    </Pressable>
  );
};
