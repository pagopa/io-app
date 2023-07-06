import * as React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import Placeholder from "rn-placeholder";
import { WithTestID } from "../../../../types/WithTestID";
import { Icon } from "../../../core/icons";
import { IOLogoPaymentType } from "../../../core/logos";
import { VSpacer } from "../../../core/spacer/Spacer";
import { NewH6 } from "../../../core/typography/NewH6";
import { IOColors } from "../../../core/variables/IOColors";
import { IOBannerRadius } from "../../../core/variables/IOShapes";
import { LogoPaymentOrDefaultIcon } from "../../baseComponents/LogoPaymentOrDefaultIcon";
import { useBaseSpringAnimation } from "../../hooks/useBaseSpringAnimation";

const getRenderData = (
  props: CardDataType
): {
  iconName: IOLogoPaymentType | undefined;
  bottomText: string;
} => {
  switch (props.cardType) {
    case "CREDIT":
      return {
        iconName: props.cardIcon,
        bottomText: ` •••• ${props.hpan}`
      };
    case "PAGOBANCOMAT":
      return {
        iconName: "pagoBancomat",
        bottomText: props.providerName
      };
    case "PAYPAL":
      return {
        iconName: "payPal",
        bottomText: "PayPal"
      };
    case "COBADGE":
      return {
        iconName: props.cardIcon,
        bottomText: props.providerName
      };
    case "BANCOMATPAY":
      return {
        iconName: "bancomatPay",
        bottomText: "BANCOMAT Pay"
      };
  }
};
type CardDataType =
  | {
      cardType: "CREDIT";
      hpan: string;
      cardIcon?: IOLogoPaymentType;
    }
  | {
      cardType: "PAGOBANCOMAT";
      providerName: string;
    }
  | {
      cardType: "PAYPAL" | "BANCOMATPAY";
    }
  | {
      cardType: "COBADGE";
      providerName: string;
      cardIcon?: IOLogoPaymentType;
    };

export type SmallPaymentCardProps = WithTestID<
  | {
      isLoading: true;
      accessibilityLabel?: string;
    }
  | ({
      isError?: boolean;
      onCardPress?: () => void;
      accessibilityLabel?: string;
      isLoading?: false;
    } & CardDataType)
>;
export const PaymentCardSmall = (props: SmallPaymentCardProps) => {
  if (props.isLoading) {
    return <CardSmallSkeleton testID={props.testID} />;
  }

  const { testID, isError, onCardPress, accessibilityLabel } = props;
  const textColor = isError ? "error-850" : "grey-700";
  const containerStyle = {
    ...styles.cardContainer,
    backgroundColor: isError ? IOColors["error-100"] : IOColors["grey-100"]
  };

  const { iconName, bottomText } = getRenderData(props);

  const Content = () => (
    <View style={containerStyle} testID={testID}>
      <View style={styles.logoRow}>
        <LogoPaymentOrDefaultIcon cardIcon={iconName} size={24} />
        {isError && (
          <Icon
            testID={`${testID}-errorIcon`}
            name="errorFilled"
            size={18}
            color="error-850"
          />
        )}
      </View>
      <VSpacer size={8} />
      <NewH6
        ellipsizeMode="tail"
        weight="Regular"
        numberOfLines={1}
        color={textColor}
      >
        {bottomText}
      </NewH6>
    </View>
  );

  return onCardPress !== undefined ? (
    <PressableBase
      onCardPress={onCardPress}
      testID={`${testID}-pressable`}
      accessibilityLabel={accessibilityLabel}
    >
      <Content />
    </PressableBase>
  ) : (
    <Content />
  );
};

const CardSmallSkeleton = ({ testID }: { testID?: string }) => (
  <View
    style={[styles.cardContainer, { backgroundColor: IOColors["grey-100"] }]}
    testID={`skeleton-${testID}`}
  >
    <Placeholder.Box
      color={IOColors["grey-200"]}
      animate="fade"
      radius={8}
      width={24}
      height={24}
    />
    <VSpacer size={8} />
    <Placeholder.Box
      color={IOColors["grey-200"]}
      animate="fade"
      radius={8}
      width={125}
      height={16}
    />
  </View>
);

const PressableBase = (
  props: React.PropsWithChildren<
    WithTestID<{
      onCardPress: () => void;
      accessibilityLabel?: string;
    }>
  >
) => {
  const { onPressIn, onPressOut, animatedScaleStyle } =
    useBaseSpringAnimation();
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

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    alignItems: "flex-start",
    alignContent: "center",
    justifyContent: "center",
    width: 160,
    flexBasis: 160,
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
