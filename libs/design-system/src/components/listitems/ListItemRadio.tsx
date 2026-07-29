import { ComponentProps, ReactNode, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import Animated from "react-native-reanimated";

import { useIOTheme } from "../../context";
import {
  IOSelectionListItemStyles,
  IOSelectionListItemVisualParams,
  IOSelectionTickVisualParams
} from "../../core";
import { useListItemAnimation } from "../../hooks";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { Icon, IOIcons } from "../icons";
import { HSpacer, VSpacer, VStack } from "../layout";
import { IOLogoPaymentType, LogoPayment } from "../logos";
import { AnimatedRadio } from "../radio/AnimatedRadio";
import { IOSkeleton } from "../skeleton";
import { BodySmall, H6 } from "../typography";

type ListItemRadioGraphicProps =
  | { icon: IOIcons; paymentLogo?: never; uri?: never }
  | { icon?: never; paymentLogo: IOLogoPaymentType; uri?: never }
  | { icon?: never; paymentLogo?: never; uri: string };

type ListItemRadioLoadingProps =
  | {
      loadingAccessibilityLabel?: never;
      skeletonDescription?: never;
      skeletonIcon?: never;
      state?: false;
    }
  | {
      loadingAccessibilityLabel?: string;
      skeletonDescription?: boolean;
      skeletonIcon?: boolean;
      state: true;
    };

type Props = WithTestID<{
  description?: ReactNode | string;
  loadingProps?: ListItemRadioLoadingProps;
  onValueChange?: (newValue: boolean) => void;
  selected: boolean;
  startImage?: ListItemRadioGraphicProps;
  value: string;
}>;

const DISABLED_OPACITY = 0.5;

type ListItemRadioProps = Pick<
  ComponentProps<typeof Pressable>,
  "accessibilityHint" | "accessibilityLabel" | "disabled" | "onPress"
> &
  Props;

const styles = StyleSheet.create({
  imageSize: {
    width: IOSelectionListItemVisualParams.iconSize,
    height: IOSelectionListItemVisualParams.iconSize,
    resizeMode: "contain"
  }
});

/**
 * `ListItemRadio` component with the automatic state management that uses a
 * {@link AnimatedCheckBox} The toggleValue change when a `onPress` event is
 * received and dispatch the `onValueChange`.
 *
 * @class
 * @param props
 */
export const ListItemRadio = ({
  value,
  description,
  startImage,
  selected,
  disabled,
  onValueChange,
  accessibilityLabel,
  accessibilityHint,
  loadingProps,
  testID
}: ListItemRadioProps) => {
  const [toggleValue, setToggleValue] = useState(selected ?? false);
  const { dynamicFontScale, spacingScaleMultiplier, hugeFontEnabled } =
    useIOFontDynamicScale();
  const { onPressIn, onPressOut, scaleAnimatedStyle, backgroundAnimatedStyle } =
    useListItemAnimation();
  const theme = useIOTheme();

  const toggleRadioItem = () => {
    ReactNativeHapticFeedback.trigger("impactLight");
    setToggleValue(!toggleValue);
    if (onValueChange !== undefined) {
      onValueChange(!toggleValue);
    }
  };

  const disabledStyle = { opacity: disabled ? DISABLED_OPACITY : 1 };

  const SkeletonDescriptionLines = () => (
    <VStack space={8}>
      <IOSkeleton height={8} radius={8} shape="rectangle" width="100%" />
      <IOSkeleton height={8} radius={8} shape="rectangle" width="100%" />
    </VStack>
  );

  const SkeletonIcon = () => (
    <View
      style={{
        marginRight: IOSelectionListItemVisualParams.iconMargin
      }}
    >
      <IOSkeleton
        radius={8}
        shape="square"
        size={IOSelectionListItemVisualParams.iconSize}
      />
    </View>
  );

  const ListItemRadioSkeleton = ({
    loadingAccessibilityLabel
  }: Pick<ListItemRadioLoadingProps, "loadingAccessibilityLabel">) => (
    <View
      accessibilityLabel={loadingAccessibilityLabel}
      accessibilityState={{ busy: true }}
      accessible={true}
      style={[IOSelectionListItemStyles.listItem, { rowGap: 8 }]}
    >
      <View style={IOSelectionListItemStyles.listItemInner}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {loadingProps?.skeletonIcon && <SkeletonIcon />}
            <IOSkeleton height={16} radius={8} shape="rectangle" width={180} />
          </View>
          <HSpacer size={8} />
          <View pointerEvents="none" style={disabledStyle}>
            <AnimatedRadio
              checked={toggleValue}
              size={IOSelectionTickVisualParams.size * dynamicFontScale}
            />
          </View>
        </View>
      </View>
      {loadingProps?.skeletonDescription && <SkeletonDescriptionLines />}
    </View>
  );

  return loadingProps?.state ? (
    <ListItemRadioSkeleton
      loadingAccessibilityLabel={loadingProps?.loadingAccessibilityLabel}
    />
  ) : (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="radio"
      accessibilityState={{
        checked: selected ?? toggleValue,
        disabled: !!disabled
      }}
      disabled={disabled}
      onPress={toggleRadioItem}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      testID={testID}
    >
      <Animated.View
        // This is required to avoid opacity
        // inheritance on Android
        needsOffscreenAlphaCompositing={true}
        style={[
          IOSelectionListItemStyles.listItem,
          backgroundAnimatedStyle,
          disabledStyle
        ]}
      >
        <Animated.View style={scaleAnimatedStyle}>
          <View style={IOSelectionListItemStyles.listItemInner}>
            <View
              style={{
                flexDirection: "row",
                flexShrink: 1,
                columnGap:
                  IOSelectionListItemVisualParams.iconMargin *
                  dynamicFontScale *
                  spacingScaleMultiplier
              }}
            >
              {startImage?.icon && !hugeFontEnabled && (
                <Icon
                  allowFontScaling
                  color={theme["icon-decorative"]}
                  name={startImage.icon}
                  size={IOSelectionListItemVisualParams.iconSize}
                />
              )}
              {startImage?.uri && (
                <View style={{ alignSelf: "center" }}>
                  <Image
                    accessibilityIgnoresInvertColors
                    source={startImage}
                    style={styles.imageSize}
                  />
                </View>
              )}
              {startImage?.paymentLogo && (
                <View style={{ alignSelf: "center" }}>
                  <LogoPayment
                    name={startImage.paymentLogo}
                    size={IOSelectionListItemVisualParams.iconSize}
                  />
                </View>
              )}
              <H6 color={theme["textBody-default"]} style={{ flexShrink: 1 }}>
                {value}
              </H6>
            </View>
            <HSpacer size={8} />
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              pointerEvents="none"
            >
              <AnimatedRadio
                checked={selected ?? toggleValue}
                size={IOSelectionTickVisualParams.size * dynamicFontScale}
              />
            </View>
          </View>
          {description && (
            <View>
              <VSpacer
                size={IOSelectionListItemVisualParams.descriptionMargin}
              />
              <BodySmall color={theme["textBody-tertiary"]} weight="Regular">
                {description}
              </BodySmall>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};
