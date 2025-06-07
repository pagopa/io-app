/* eslint-disable functional/immutable-data */
import {
  ContentWrapper,
  IconButton,
  IOColors,
  IOSpringValues,
  IOVisualCostants,
  useIOThemeContext
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { MutableRefObject, ReactNode, useCallback, useRef } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView
} from "react-native-gesture-handler";
import HapticFeedback from "react-native-haptic-feedback";
import Animated, {
  interpolateColor,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";

// Props for the right action icon
type RightActionsProps = {
  onRightActionPressed: () => void;
  accessibilityLabel: string;
  translateX: SharedValue<number>;
  backgroundColor: string;
} & Pick<IconButton, "color" | "icon">;

const RightActions = ({
  onRightActionPressed,
  accessibilityLabel,
  translateX,
  backgroundColor,
  icon,
  color
}: RightActionsProps) => {
  const animatedIconStyle = useAnimatedStyle(() => {
    const clamped = Math.max(-translateX.value, 0);
    const progress = Math.min(clamped / 60, 1);

    return {
      transform: [{ scale: progress }],
      opacity: progress
    };
  });

  return (
    <View
      style={{
        backgroundColor,
        justifyContent: "center",
        alignItems: "flex-end",
        paddingRight: 18,
        flex: 1,
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: 60
      }}
    >
      <Animated.View style={animatedIconStyle}>
        <IconButton
          accessibilityLabel={accessibilityLabel}
          icon={icon}
          color={color}
          onPress={onRightActionPressed}
        />
      </Animated.View>
    </View>
  );
};

export type SwipeControls = {
  resetSwipePosition: () => void;
  triggerSwipeAction: () => void;
};

// Props for the swipeable list item
type ListItemSwipeActionProps = {
  children: ReactNode;
  icon: IconButton["icon"];
  color: IconButton["color"];
  accessibilityLabel?: string;
  onRightActionPressed: (controls: SwipeControls) => void;
  openedItemRef?: MutableRefObject<(() => void) | null>;
};

const ListItemSwipeAction = ({
  children,
  icon,
  color,
  accessibilityLabel = "",
  onRightActionPressed,
  openedItemRef
}: ListItemSwipeActionProps) => {
  const hapticTriggered = useRef(false);
  const translateX = useSharedValue(0);
  const { theme } = useIOThemeContext();
  const { width } = useWindowDimensions();
  const gestureContext = useRef({ startX: 0 });

  const resetSwipePosition = () => {
    translateX.value = withSpring(0, IOSpringValues.accordion);
  };

  const triggerSwipeAction = () => {
    translateX.value = withTiming(-500, { duration: 300 });
  };

  const backgroundStyle = useAnimatedStyle(() => {
    const interpolatedColor =
      translateX.value === 0
        ? IOColors[theme["appBackground-primary"]]
        : interpolateColor(
            translateX.value,
            [-width * 0.9, -width * 0.2],
            [IOColors["error-600"], IOColors["error-600"]]
          );

    return {
      backgroundColor: interpolatedColor
    };
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }));

  const triggerHaptic = () => HapticFeedback.trigger("impactLight");

  // Define the gesture action and props
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .onBegin(() => {
      gestureContext.current.startX = translateX.value;
    })
    .onUpdate(event => {
      const translationX = event.translationX;
      if (translationX < 0) {
        const newTranslateX = gestureContext.current.startX + translationX;
        translateX.value = Math.max(newTranslateX, -width * 0.9);

        if (
          openedItemRef?.current &&
          openedItemRef.current !== resetSwipePosition
        ) {
          openedItemRef.current();
        }

        if (openedItemRef) {
          openedItemRef.current = resetSwipePosition;
        }

        if (translationX < -200 && !hapticTriggered.current) {
          runOnJS(triggerHaptic)();
          hapticTriggered.current = true;
        } else if (translationX >= -200) {
          hapticTriggered.current = false;
        }
      }
    })
    .onEnd(event => {
      const { translationX, velocityX } = event;
      if (translationX < -200 || velocityX < -800) {
        runOnJS(onRightActionPressed)({
          resetSwipePosition,
          triggerSwipeAction
        });
      } else {
        translateX.value = withSpring(
          translationX < -50 ? -60 : 0,
          IOSpringValues.accordion
        );
      }
    })
    .withTestId("swipe-gesture");

  // Reset when screen refocuses (e.g., after navigating back)
  useFocusEffect(
    useCallback(
      () => () => {
        translateX.value = withSpring(0, IOSpringValues.accordion);
      },
      [translateX]
    )
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ContentWrapper style={{ flex: 1, position: "relative" }}>
        <Animated.View
          style={[StyleSheet.absoluteFillObject, backgroundStyle]}
        />
        <RightActions
          icon={icon}
          color={color}
          backgroundColor={backgroundStyle.backgroundColor}
          translateX={translateX}
          onRightActionPressed={() =>
            onRightActionPressed({ resetSwipePosition, triggerSwipeAction })
          }
          accessibilityLabel={accessibilityLabel}
        />
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              {
                flex: 1,
                backgroundColor: IOColors[theme["appBackground-primary"]],
                marginHorizontal: IOVisualCostants.appMarginDefault * -1
              },
              animatedStyle
            ]}
          >
            <ContentWrapper>{children}</ContentWrapper>
          </Animated.View>
        </GestureDetector>
      </ContentWrapper>
    </GestureHandlerRootView>
  );
};

export default ListItemSwipeAction;
