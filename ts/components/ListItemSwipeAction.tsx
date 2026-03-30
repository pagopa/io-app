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
import { ReactNode, RefObject, memo, useCallback, useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView
} from "react-native-gesture-handler";
import HapticFeedback from "react-native-haptic-feedback";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { scheduleOnRN, scheduleOnUI } from "react-native-worklets";

const ACTION_WIDTH = 60;
const HAPTIC_THRESHOLD = -200;
const SNAP_THRESHOLD = -50;

const styles = StyleSheet.create({
  gestureHandlerRoot: {
    flex: 1
  },
  contentWrapper: {
    flex: 1,
    position: "relative"
  },
  rightActionsContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 18,
    flex: 1,
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: ACTION_WIDTH
  }
});

// Props for the right action icon
type RightActionsProps = {
  onRightActionPressed: () => void;
  accessibilityLabel: string;
  translateX: SharedValue<number>;
} & Pick<IconButton, "color" | "icon">;

const RightActions = memo(
  ({
    onRightActionPressed,
    accessibilityLabel,
    translateX,
    icon,
    color
  }: RightActionsProps) => {
    const animatedIconStyle = useAnimatedStyle(() => {
      const clamped = Math.max(-translateX.value, 0);
      const progress = Math.min(clamped / ACTION_WIDTH, 1);

      return {
        transform: [{ scale: progress }],
        opacity: progress
      };
    });

    return (
      <Animated.View style={styles.rightActionsContainer}>
        <Animated.View style={animatedIconStyle}>
          <IconButton
            accessibilityLabel={accessibilityLabel}
            icon={icon}
            color={color}
            onPress={onRightActionPressed}
          />
        </Animated.View>
      </Animated.View>
    );
  }
);

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
  openedItemRef?: RefObject<(() => void) | null>;
};

const ListItemSwipeAction = ({
  children,
  icon,
  color,
  accessibilityLabel = "",
  onRightActionPressed,
  openedItemRef
}: ListItemSwipeActionProps) => {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const hapticTriggered = useSharedValue(false);
  const swipeStartHandled = useSharedValue(false);
  const { theme } = useIOThemeContext();
  const { width } = useWindowDimensions();

  const maxSwipeDistance = width * 0.9;

  const resetSwipePositionWorklet = useCallback(() => {
    "worklet";
    translateX.value = withSpring(0, IOSpringValues.accordion);
  }, [translateX]);

  const triggerSwipeActionWorklet = useCallback(() => {
    "worklet";
    translateX.value = withTiming(-500, { duration: 300 });
  }, [translateX]);

  const resetSwipePosition = useCallback(() => {
    scheduleOnUI(resetSwipePositionWorklet);
  }, [resetSwipePositionWorklet]);

  const triggerSwipeAction = useCallback(() => {
    scheduleOnUI(triggerSwipeActionWorklet);
  }, [triggerSwipeActionWorklet]);

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor:
      translateX.value < 0 ? IOColors["error-600"] : "transparent"
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }));

  const triggerHaptic = () => {
    HapticFeedback.trigger("impactLight");
  };

  const handleSwipeStart = () => {
    if (openedItemRef?.current) {
      scheduleOnUI(openedItemRef.current);
    }
    if (openedItemRef) {
      openedItemRef.current = resetSwipePositionWorklet;
    }
  };

  const handleSwipeEnd = () => {
    onRightActionPressed({ resetSwipePosition, triggerSwipeAction });
  };

  // Define the gesture action and props
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .onBegin(() => {
      "worklet";
      startX.value = translateX.value;
      swipeStartHandled.value = false;
    })
    .onUpdate(event => {
      "worklet";
      const translationX = event.translationX;
      if (translationX < 0) {
        translateX.value = Math.max(
          startX.value + translationX,
          -maxSwipeDistance
        );

        // Close other opened items when starting to swipe (only once)
        if (
          startX.value === 0 &&
          translationX < -10 &&
          !swipeStartHandled.value
        ) {
          swipeStartHandled.value = true;
          scheduleOnRN(handleSwipeStart);
        }

        if (translationX < HAPTIC_THRESHOLD && !hapticTriggered.value) {
          scheduleOnRN(triggerHaptic);
          hapticTriggered.value = true;
        } else if (translationX >= HAPTIC_THRESHOLD) {
          hapticTriggered.value = false;
        }
      }
    })
    .onEnd(event => {
      "worklet";
      const { translationX, velocityX } = event;
      if (translationX < HAPTIC_THRESHOLD || velocityX < -800) {
        scheduleOnRN(handleSwipeEnd);
      } else {
        translateX.value = withSpring(
          translationX < SNAP_THRESHOLD ? -ACTION_WIDTH : 0,
          IOSpringValues.accordion
        );
      }
    })
    .withTestId("swipe-gesture");

  // Reset when screen refocuses (e.g., after navigating back)
  useFocusEffect(
    useCallback(
      () => () => {
        scheduleOnUI(resetSwipePositionWorklet);
      },
      [resetSwipePositionWorklet]
    )
  );

  const swipeableContentStyle = useMemo(
    () => ({
      flex: 1,
      backgroundColor: IOColors[theme["appBackground-primary"]],
      marginHorizontal: IOVisualCostants.appMarginDefault * -1
    }),
    [theme]
  );

  const handleRightActionPressed = useCallback(() => {
    onRightActionPressed({ resetSwipePosition, triggerSwipeAction });
  }, [onRightActionPressed, resetSwipePosition, triggerSwipeAction]);

  return (
    <GestureHandlerRootView style={styles.gestureHandlerRoot}>
      <ContentWrapper style={styles.contentWrapper}>
        <Animated.View
          style={[StyleSheet.absoluteFillObject, backgroundStyle]}
        />
        <RightActions
          icon={icon}
          color={color}
          translateX={translateX}
          onRightActionPressed={handleRightActionPressed}
          accessibilityLabel={accessibilityLabel}
        />
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[swipeableContentStyle, animatedStyle]}>
            <ContentWrapper>{children}</ContentWrapper>
          </Animated.View>
        </GestureDetector>
      </ContentWrapper>
    </GestureHandlerRootView>
  );
};

export default ListItemSwipeAction;
