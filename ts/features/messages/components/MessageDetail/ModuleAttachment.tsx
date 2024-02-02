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
  Badge,
  IOColors,
  IOListItemVisualParams,
  IOScaleValues,
  IOSpringValues,
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

type PartialProps = WithTestID<{
  title: string;
  format: "doc" | "pdf";
  isLoading?: boolean;
  loadingAccessibilityLabel?: string;
  isFetching?: boolean;
  fetchingAccessibilityLabel?: string;
  onPress: (event: GestureResponderEvent) => void;
}>;

export type ModuleAttachmentProps = PartialProps &
  Pick<
    PressableProps,
    "onPress" | "accessibilityLabel" | "disabled" | "testID"
  >;

type SkeletonComponentProps = {
  loadingAccessibilityLabel?: string;
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    borderColor: IOColors.bluegreyLight,
    backgroundColor: IOColors.white,
    borderStyle: "solid",
    borderWidth: 1
  },
  innerContent: {
    flex: 1,
    flexDirection: "column"
  },
  rightSection: {
    marginLeft: IOListItemVisualParams.iconMargin,
    alignItems: "center"
  }
});

const DISABLED_OPACITY = 0.5;

const ModuleAttachmentContent = ({
  isFetching,
  format,
  title,
  testID
}: Pick<
  ModuleAttachmentProps,
  "isFetching" | "format" | "title" | "testID"
>) => {
  const IconOrActivityIndicatorComponent = () => {
    if (isFetching) {
      const activityIndicatorTestId = testID
        ? `${testID}_activityIndicator`
        : undefined;
      return (
        <ActivityIndicator
          color={IOColors.blue}
          testID={activityIndicatorTestId}
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
      <View style={styles.innerContent}>
        <LabelSmall
          numberOfLines={1}
          weight="SemiBold"
          font="ReadexPro"
          color="blueIO-500"
        >
          {title}
        </LabelSmall>
        <VSpacer size={4} />
        <View style={{ width: 44 }}>
          <Badge text={format.toUpperCase()} variant="default" />
        </View>
      </View>
      <View style={styles.rightSection}>
        <IconOrActivityIndicatorComponent />
      </View>
    </>
  );
};

/**
 * The `ModuleAttachment` component is a custom button component with an extended outline style.
 * It provides an animated scaling effect when pressed.
 *
 * @param {string}   accessibilityLabel - Optional accessibility label.
 * @param {boolean}  disabled - If true, the button is disabled.
 * @param {string}   fetchingAccessibilityLabel - Optional accessibility label to use during fetching.
 * @param {string}   format - Badge content. PDF or DOC.
 * @param {boolean}  isLoading - If true, displays a skeleton loading component.
 * @param {boolean}  isFetching - If true, displays an activity indicator.
 * @param {string}   loadingAccessibilityLabel - Optional accessibility label to use during loading.
 * @param {function} onPress - The function to be executed when the item is pressed.
 * @param {string}   testID - The test ID for testing purposes.
 * @param {string}   title - The title text to display.
 *
 */
export const ModuleAttachment = ({
  accessibilityLabel,
  disabled = false,
  fetchingAccessibilityLabel,
  format,
  isLoading = false,
  isFetching = false,
  loadingAccessibilityLabel,
  onPress,
  testID,
  title
}: ModuleAttachmentProps) => {
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
    return (
      <SkeletonComponent
        loadingAccessibilityLabel={loadingAccessibilityLabel}
      />
    );
  }

  const pressableAccessibilityLabel =
    (isFetching ? fetchingAccessibilityLabel : accessibilityLabel) ?? title;
  return (
    <Pressable
      testID={testID}
      onPress={handleOnPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessible={true}
      accessibilityRole={"button"}
      accessibilityHint={format}
      accessibilityLabel={pressableAccessibilityLabel}
      disabled={disabled || isFetching}
    >
      <Animated.View
        style={[
          styles.button,
          animatedStyle,
          { opacity: disabled ? DISABLED_OPACITY : 1 }
        ]}
      >
        <ModuleAttachmentContent
          isFetching={isFetching}
          title={title}
          format={format}
        />
      </Animated.View>
    </Pressable>
  );
};

const SkeletonComponent = ({
  loadingAccessibilityLabel
}: SkeletonComponentProps) => (
  <View
    style={styles.button}
    accessible={true}
    accessibilityLabel={loadingAccessibilityLabel}
  >
    <View style={styles.innerContent}>
      <Placeholder.Box animate="fade" radius={8} width={107} height={22} />
      <VSpacer size={4} />
      <Placeholder.Box animate="fade" radius={8} width={44} height={22} />
    </View>
  </View>
);
