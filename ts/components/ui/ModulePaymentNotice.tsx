import * as React from "react";
import { useCallback } from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  View
} from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import {
  IOColors,
  IOSpringValues,
  IOScaleValues,
  Icon,
  IOListItemVisualParams,
  VSpacer
} from "@pagopa/io-app-design-system";
import Placeholder from "rn-placeholder";
import { IOStyles } from "../core/variables/IOStyles";
import { LabelSmall } from "../core/typography/LabelSmall";
import { WithTestID } from "../../types/WithTestID";
import { NewH6 } from "../core/typography/NewH6";
import { getAccessibleAmountText } from "../../utils/accessibility";
import { IOBadge } from "../core/IOBadge";
import I18n from "../../i18n";

export type PaymentNoticeStatus =
  | "default"
  | "payed"
  | "error"
  | "expired"
  | "revoked"
  | "canceled";

type Props = WithTestID<
  {
    isLoading?: boolean;
    accessibilityLabel?: string;
    title?: string;
    subtitle: string;
    onPress: (event: GestureResponderEvent) => void;
  } & (
    | {
        paymentNoticeStatus: Extract<PaymentNoticeStatus, "default">;
        paymentNoticeAmount: string;
      }
    | {
        paymentNoticeStatus: Exclude<PaymentNoticeStatus, "default">;
        paymentNoticeAmount?: never;
      }
  )
>;

const ModulePaymentNoticeContent = ({
  title,
  subtitle,
  paymentNoticeStatus,
  paymentNoticeAmount
}: Omit<Props, "isLoading" | "onPress" | "testID">) => {
  const AmountOrBadgeComponent = () => {
    switch (paymentNoticeStatus) {
      case "default":
        return (
          <NewH6
            accessibilityLabel={getAccessibleAmountText(paymentNoticeAmount)}
            color="blue"
          >
            {paymentNoticeAmount}
          </NewH6>
        );
      case "payed":
        return (
          <IOBadge
            variant="solid"
            color="aqua"
            text={I18n.t("global.modules.paymentNotice.badges.payed")}
          />
        );
      case "error":
        return (
          <IOBadge
            variant="outline"
            color="red"
            text={I18n.t("global.modules.paymentNotice.badges.error")}
          />
        );
      case "expired":
        return (
          <IOBadge
            variant="outline"
            color="grey"
            text={I18n.t("global.modules.paymentNotice.badges.expired")}
          />
        );
      case "revoked":
        return (
          <IOBadge
            variant="outline"
            color="grey"
            text={I18n.t("global.modules.paymentNotice.badges.revoked")}
          />
        );
      case "canceled":
        return (
          <IOBadge
            variant="outline"
            color="grey"
            text={I18n.t("global.modules.paymentNotice.badges.canceled")}
          />
        );
    }
  };

  return (
    <>
      <View style={{ flexGrow: 1, flexShrink: 1 }}>
        {title && (
          <LabelSmall numberOfLines={1} weight="Regular" color="bluegrey">
            {title}
          </LabelSmall>
        )}
        <LabelSmall weight="SemiBold" color="bluegrey">
          {subtitle}
        </LabelSmall>
      </View>
      <View style={[styles.rightSection, { flexShrink: 1 }]}>
        <AmountOrBadgeComponent />
        <Icon
          name="chevronRightListItem"
          color="blue"
          size={IOListItemVisualParams.chevronSize}
        />
      </View>
    </>
  );
};

/**
 * The `ModulePaymentNotice` component is a custom button component with an extended outline style.
 * It provides an animated scaling effect when pressed.
 *
 * @param {boolean} isLoading - If true, displays a skeleton loading component.
 * @param {function} onPress - The function to be executed when the item is pressed.
 * @param {string} title - The title text to display.
 * @param {string} subtitle - The subtitle text to display.
 * @param {string} testID - The test ID for testing purposes.
 * @param {string} paymentNoticeAmount - The payment notice amount to display.
 * @param {string} paymentNoticeStatus - The status of the payment notice.
 */
export const ModulePaymentNotice = ({
  isLoading = false,
  testID,
  accessibilityLabel,
  onPress,
  ...rest
}: Props) => {
  const isPressed: Animated.SharedValue<number> = useSharedValue(0);

  // Scaling transformation applied when the button is pressed
  const animationScaleValue = IOScaleValues?.magnifiedButton?.pressedState;

  const scaleTraversed = useDerivedValue(() =>
    withSpring(isPressed.value, IOSpringValues.button)
  );

  // Interpolate animation values from `isPressed` values
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scaleTraversed.value,
      [0, 1],
      [1, animationScaleValue],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }]
    };
  });

  const onPressIn = useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isPressed.value = 1;
  }, [isPressed]);

  const onPressOut = useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isPressed.value = 0;
  }, [isPressed]);

  if (isLoading) {
    return <SkeletonComponent />;
  }

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessible={true}
      accessibilityRole={"button"}
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={[styles.button, animatedStyle]}>
        <ModulePaymentNoticeContent {...rest} />
      </Animated.View>
    </Pressable>
  );
};

const SkeletonComponent = () => (
  <View style={styles.button} accessible={false}>
    <View style={IOStyles.flex}>
      <Placeholder.Box animate="fade" radius={8} width={179} height={16} />
      <VSpacer size={4} />
      <Placeholder.Box animate="fade" radius={8} width={121} height={13} />
    </View>
    <View style={{ marginLeft: IOListItemVisualParams.iconMargin }}>
      <Placeholder.Box animate="fade" radius={8} width={62} height={16} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    borderColor: IOColors.bluegreyLight,
    backgroundColor: IOColors.white,
    borderStyle: "solid",
    borderWidth: 1
  },
  rightSection: {
    marginLeft: IOListItemVisualParams.iconMargin,
    flexDirection: "row",
    alignItems: "center"
  }
});
