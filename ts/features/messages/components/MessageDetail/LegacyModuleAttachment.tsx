import React, { useCallback } from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleSheet,
  View
} from "react-native";
import {
  IOColors,
  IOIconSizeScale,
  IOIcons,
  IOListItemVisualParams,
  IOScaleValues,
  IOSpacingScale,
  IOSpringValues,
  IOStyles,
  Icon,
  LabelSmall,
  VSpacer,
  WithTestID
} from "@pagopa/io-app-design-system";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import Placeholder from "rn-placeholder";
import I18n from "../../../../i18n";

type PartialProps = WithTestID<{
  title: string;
  format: "doc" | "pdf";
  subtitle?: string;
  isLoading?: boolean;
  isFetching?: boolean;
  onPress: (event: GestureResponderEvent) => void;
}>;

export type LegacyModuleAttachmentProps = PartialProps &
  Pick<PressableProps, "onPress" | "accessibilityLabel" | "disabled">;

const formatMap: Record<
  NonNullable<LegacyModuleAttachmentProps["format"]>,
  IOIcons
> = {
  doc: "docAttach",
  pdf: "docAttachPDF"
};

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
    alignItems: "center",
    justifyContent: "flex-end"
  }
});

const DISABLED_OPACITY = 0.5;
const ICON_SIZE: IOIconSizeScale = 32;
const MARGIN_SIZE: IOSpacingScale = 16;

const LegacyModuleAttachmentContent = ({
  isFetching,
  format,
  title,
  subtitle
}: Pick<
  LegacyModuleAttachmentProps,
  "isFetching" | "format" | "title" | "subtitle"
>) => {
  const IconOrActivityIndicatorComponent = () => {
    if (isFetching) {
      return (
        <ActivityIndicator
          color={IOColors.blue}
          accessible={true}
          accessibilityHint={I18n.t(
            "global.accessibility.activityIndicator.hint"
          )}
          accessibilityLabel={I18n.t(
            "global.accessibility.activityIndicator.label"
          )}
          importantForAccessibility={"no-hide-descendants"}
          testID={"activityIndicator"}
        />
      );
    }

    return (
      <Icon
        name="chevronRightListItem"
        color="blue"
        size={IOListItemVisualParams.chevronSize}
      />
    );
  };

  return (
    <>
      <View style={{ marginRight: MARGIN_SIZE }}>
        <Icon name={formatMap[format]} size={ICON_SIZE} color="blue" />
      </View>
      <View style={IOStyles.flex}>
        <LabelSmall numberOfLines={1} weight="SemiBold" color="bluegrey">
          {title}
        </LabelSmall>
        {subtitle && (
          <LabelSmall weight="Regular" color="bluegrey">
            {subtitle}
          </LabelSmall>
        )}
      </View>
      <View style={styles.rightSection}>
        <IconOrActivityIndicatorComponent />
      </View>
    </>
  );
};

/**
 * The `LegacyModuleAttachment` component is a custom button component with an extended outline style.
 * It provides an animated scaling effect when pressed.
 *
 * @param {boolean} isLoading - If true, displays a skeleton loading component.
 * @param {boolean} isFetching - If true, displays an activity indicator.
 * @param {boolean} disabled - If true, the button is disabled.
 * @param {string} testID - The test ID for testing purposes.
 * @param {string} title - The title text to display.
 * @param {string} subtitle - The subtitle text to display.
 * @param {string} iconName - The icon name to display.
 * @param {function} onPress - The function to be executed when the item is pressed.
 */
export const LegacyModuleAttachment = ({
  isLoading = false,
  isFetching = false,
  disabled = false,
  testID,
  accessibilityLabel,
  onPress,
  ...rest
}: LegacyModuleAttachmentProps) => {
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

  const handleOnPress = useCallback(
    (event: GestureResponderEvent) => {
      if (isFetching) {
        return;
      }
      onPress(event);
    },
    [isFetching, onPress]
  );

  if (isLoading) {
    return <SkeletonComponent />;
  }

  return (
    <Pressable
      testID={testID}
      onPress={handleOnPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessible={true}
      accessibilityRole={"button"}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled || isFetching}
    >
      <Animated.View
        style={[
          styles.button,
          animatedStyle,
          { opacity: disabled ? DISABLED_OPACITY : 1 }
        ]}
      >
        <LegacyModuleAttachmentContent isFetching={isFetching} {...rest} />
      </Animated.View>
    </Pressable>
  );
};

const SkeletonComponent = () => (
  <View style={styles.button} accessible={false}>
    <View style={{ marginRight: MARGIN_SIZE }}>
      <Placeholder.Box
        animate="fade"
        height={ICON_SIZE}
        width={ICON_SIZE}
        radius={100}
      />
    </View>
    <View style={IOStyles.flex}>
      <Placeholder.Box animate="fade" radius={8} width={107} height={16} />
      <VSpacer size={4} />
      <Placeholder.Box animate="fade" radius={8} width={62} height={16} />
    </View>
  </View>
);
