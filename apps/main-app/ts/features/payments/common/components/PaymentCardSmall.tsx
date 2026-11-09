import {
  Icon,
  IODimensions,
  IOSkeleton,
  LabelMini,
  VSpacer
} from "@io-app/design-system";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { LogoPaymentWithFallback } from "../../../../components/ui/utils/components/LogoPaymentWithFallback";
import { WithTestID } from "../../../../types/WithTestID";
import { WalletCardPressableBase } from "../../../wallet/components/WalletCardPressableBase";
import { usePaymentsColors } from "../hooks/usePaymentsColors";
import { PaymentCardProps } from "./PaymentCard";

export type PaymentCardSmallProps = WithTestID<
  PaymentCardProps & {
    accessibilityLabel?: string;
    bankName?: string;
    onPress?: () => void;
  }
>;

const usePaymentCardStyles = () => {
  const { card } = usePaymentsColors();

  const textColorDefault = card.text;
  const textColorError = card.expired.text;
  const backgroundColorDefault = card.background;
  const backgroundColorError = card.expired.background;
  const skeletonColor = card.skeleton;

  return {
    textColorDefault,
    textColorError,
    backgroundColorDefault,
    backgroundColorError,
    skeletonColor
  };
};

const PaymentCardSmall = ({
  testID,
  onPress,
  accessibilityLabel,
  ...props
}: PaymentCardSmallProps) => {
  const {
    textColorDefault,
    textColorError,
    backgroundColorDefault,
    backgroundColorError
  } = usePaymentCardStyles();

  const labelText = useMemo(() => {
    if (props.hpan) {
      return `•••• ${props.hpan}`;
    }

    if (props.holderEmail) {
      return "PayPal";
    }

    if (props.holderPhone) {
      return "BANCOMAT Pay";
    }

    if (props.bankName) {
      return props.bankName;
    }

    return props.brand;
  }, [props]);

  const iconName = useMemo(() => {
    if (props.holderEmail) {
      return "paypal";
    }

    if (props.holderPhone) {
      return "bancomatpay";
    }

    return props.brand;
  }, [props]);

  return (
    <WalletCardPressableBase
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      testID={`${testID}-pressable`}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: props.isExpired
              ? backgroundColorError
              : backgroundColorDefault
          }
        ]}
        testID={testID}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <LogoPaymentWithFallback brand={iconName} size={24} />
          {props.isExpired && (
            <Icon
              color={textColorError}
              name="errorFilled"
              size={16}
              testID={`${testID}-errorIcon`}
            />
          )}
        </View>
        <VSpacer size={8} />
        <LabelMini
          color={props.isExpired ? textColorError : textColorDefault}
          ellipsizeMode="tail"
          numberOfLines={1}
          weight="Regular"
        >
          {labelText}
        </LabelMini>
      </View>
    </WalletCardPressableBase>
  );
};

const PaymentCardSmallSkeleton = ({ testID }: WithTestID<unknown>) => {
  const { backgroundColorDefault, skeletonColor } = usePaymentCardStyles();

  return (
    <View
      style={[styles.card, { backgroundColor: backgroundColorDefault }]}
      testID={`${testID}-skeleton`}
    >
      <IOSkeleton color={skeletonColor} radius={12} shape="square" size={24} />
      <VSpacer size={8} />
      <IOSkeleton
        color={skeletonColor}
        height={16}
        radius={8}
        shape="rectangle"
        width={"100%"}
      />
    </View>
  );
};

export const PAYMENT_CARD_SMALL_WIDTH = 127;
export const PAYMENT_CARD_SMALL_HEIGHT = 80;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    width: PAYMENT_CARD_SMALL_WIDTH,
    height: PAYMENT_CARD_SMALL_HEIGHT,
    flexBasis: PAYMENT_CARD_SMALL_WIDTH,
    flexGrow: 0,
    borderRadius: IODimensions.radius.card,
    padding: IODimensions.padding.card,
    aspectRatio: 16 / 10
  }
});

export { PaymentCardSmall, PaymentCardSmallSkeleton };
