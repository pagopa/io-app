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
import { IOIcons, Icon } from "../icons";
import { HSpacer, VSpacer, VStack } from "../layout";
import { IOLogoPaymentType, LogoPayment } from "../logos";
import { AnimatedRadio } from "../radio/AnimatedRadio";
import { IOSkeleton } from "../skeleton";
import { BodySmall, H6 } from "../typography";

type ListItemRadioGraphicProps =
  | { icon?: never; paymentLogo: IOLogoPaymentType; uri?: never }
  | { icon?: never; paymentLogo?: never; uri: string }
  | { icon: IOIcons; paymentLogo?: never; uri?: never };

type ListItemRadioLoadingProps =
  | {
      state: true;
      skeletonDescription?: boolean;
      skeletonIcon?: boolean;
      loadingAccessibilityLabel?: string;
    }
  | {
      state?: false;
      skeletonDescription?: never;
      skeletonIcon?: never;
      loadingAccessibilityLabel?: never;
    };

type Props = WithTestID<{
  value: string;
  description?: string | ReactNode;
  selected: boolean;
  onValueChange?: (newValue: boolean) => void;
  startImage?: ListItemRadioGraphicProps;
  loadingProps?: ListItemRadioLoadingProps;
}>;

const DISABLED_OPACITY = 0.5;

type ListItemRadioProps = Props &
  Pick<
    ComponentProps<typeof Pressable>,
    "onPress" | "accessibilityLabel" | "accessibilityHint" | "disabled"
  >;

const styles = StyleSheet.create({
  imageSize: {
    width: IOSelectionListItemVisualParams.iconSize,
    height: IOSelectionListItemVisualParams.iconSize,
    resizeMode: "contain"
  }
});

/**
 * `ListItemRadio` component with the automatic state management that uses a {@link AnimatedCheckBox}
 * The toggleValue change when a `onPress` event is received and dispatch the `onValueChange`.
 *
 * @param props
 * @constructor
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
      <IOSkeleton shape="rectangle" width="100%" height={8} radius={8} />
      <IOSkeleton shape="rectangle" width="100%" height={8} radius={8} />
    </VStack>
  );

  const SkeletonIcon = () => (
    <View
      style={{
        marginRight: IOSelectionListItemVisualParams.iconMargin
      }}
    >
      <IOSkeleton
        shape="square"
        size={IOSelectionListItemVisualParams.iconSize}
        radius={8}
      />
    </View>
  );

  const ListItemRadioSkeleton = ({
    loadingAccessibilityLabel
  }: Pick<ListItemRadioLoadingProps, "loadingAccessibilityLabel">) => (
    <View
      style={[IOSelectionListItemStyles.listItem, { rowGap: 8 }]}
      accessible={true}
      accessibilityLabel={loadingAccessibilityLabel}
      accessibilityState={{ busy: true }}
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
            <IOSkeleton shape="rectangle" width={180} height={16} radius={8} />
          </View>
          <HSpacer size={8} />
          <View pointerEvents="none" style={disabledStyle}>
            <AnimatedRadio
              size={IOSelectionTickVisualParams.size * dynamicFontScale}
              checked={toggleValue}
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
      accessibilityRole="radio"
      accessibilityState={{
        checked: selected ?? toggleValue,
        disabled: !!disabled
      }}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPress={toggleRadioItem}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      testID={testID}
      disabled={disabled}
    >
      <Animated.View
        style={[
          IOSelectionListItemStyles.listItem,
          backgroundAnimatedStyle,
          disabledStyle
        ]}
        // This is required to avoid opacity
        // inheritance on Android
        needsOffscreenAlphaCompositing={true}
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
                  name={startImage.icon}
                  color={theme["icon-decorative"]}
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
              pointerEvents="none"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <AnimatedRadio
                size={IOSelectionTickVisualParams.size * dynamicFontScale}
                checked={selected ?? toggleValue}
              />
            </View>
          </View>
          {description && (
            <View>
              <VSpacer
                size={IOSelectionListItemVisualParams.descriptionMargin}
              />
              <BodySmall weight="Regular" color={theme["textBody-tertiary"]}>
                {description}
              </BodySmall>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};
