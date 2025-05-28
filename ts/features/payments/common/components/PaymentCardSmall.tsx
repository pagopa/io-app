import {
  IOColors,
  IOSkeleton,
  Icon,
  LabelMini,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { LogoPaymentWithFallback } from "../../../../components/ui/utils/components/LogoPaymentWithFallback";
import { WithTestID } from "../../../../types/WithTestID";
import { WalletCardPressableBase } from "../../../wallet/components/WalletCardPressableBase";
import { PaymentCardProps } from "./PaymentCard";

export type PaymentCardSmallProps = WithTestID<
  PaymentCardProps & {
    bankName?: string;
    onPress?: () => void;
    accessibilityLabel?: string;
  }
>;

const PaymentCardSmall = ({
  testID,
  onPress,
  accessibilityLabel,
  ...props
}: PaymentCardSmallProps) => {
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
      onPress={onPress}
      testID={`${testID}-pressable`}
      accessibilityLabel={accessibilityLabel}
    >
      <View
        style={[styles.card, props.isExpired && styles.cardError]}
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
              testID={`${testID}-errorIcon`}
              name="errorFilled"
              size={16}
              color="error-850"
            />
          )}
        </View>
        <VSpacer size={8} />
        <LabelMini
          weight="Regular"
          ellipsizeMode="tail"
          numberOfLines={1}
          color={props.isExpired ? "error-850" : "grey-700"}
        >
          {labelText}
        </LabelMini>
      </View>
    </WalletCardPressableBase>
  );
};

const PaymentCardSmallSkeleton = ({ testID }: WithTestID<unknown>) => (
  <View style={styles.card} testID={`${testID}-skeleton`}>
    <IOSkeleton
      color={IOColors["grey-200"]}
      shape="square"
      size={24}
      radius={12}
    />
    <VSpacer size={8} />
    <IOSkeleton
      color={IOColors["grey-200"]}
      shape="rectangle"
      width={"100%"}
      height={16}
      radius={8}
    />
  </View>
);

export const PAYMENT_CARD_SMALL_WIDTH = 127;
export const PAYMENT_CARD_SMALL_HEIGHT = 80;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    width: PAYMENT_CARD_SMALL_WIDTH,
    height: PAYMENT_CARD_SMALL_HEIGHT,
    flexBasis: PAYMENT_CARD_SMALL_WIDTH,
    flexGrow: 0,
    borderRadius: 8,
    padding: 16,
    aspectRatio: 16 / 10,
    backgroundColor: IOColors["grey-100"]
  },
  cardError: {
    backgroundColor: IOColors["error-100"]
  }
});

export { PaymentCardSmall, PaymentCardSmallSkeleton };
