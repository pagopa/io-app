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
import { Alert, StyleSheet, useWindowDimensions, View } from "react-native";
import {
  GestureEvent,
  GestureHandlerRootView,
  HandlerStateChangeEvent,
  PanGestureHandler,
  PanGestureHandlerEventPayload
} from "react-native-gesture-handler";
import HapticFeedback from "react-native-haptic-feedback";
import Animated, {
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";

type RightActionsProps = {
  showDeleteAlert: () => void;
  accessibilityLabel: string;
  translateX: SharedValue<number>;
  backgroundColor: string;
} & Pick<IconButton, "color" | "icon">;

const RightActions = ({
  showDeleteAlert,
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
          onPress={showDeleteAlert}
        />
      </Animated.View>
    </View>
  );
};

type ListItemSwipeActionProps = {
  children: ReactNode;
  swipeAction: () => void;
  alertProps: {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
  };
  accessibilityLabel?: string;
  openedItemRef?: MutableRefObject<(() => void) | null>;
} & Pick<IconButton, "color" | "icon">;

const ListItemSwipeAction = ({
  children,
  swipeAction,
  alertProps,
  accessibilityLabel = "",
  openedItemRef,
  icon,
  color
}: ListItemSwipeActionProps) => {
  const hapticTriggered = useRef(false);
  const translateX = useSharedValue(0);
  const { theme } = useIOThemeContext();
  const { width } = useWindowDimensions();
  const backgroundColor = IOColors[theme["appBackground-primary"]];

  const gestureContext = useRef({ startX: 0 });

  const showAlertAction = () =>
    Alert.alert(alertProps.title, alertProps.message, [
      {
        text: alertProps.cancelText,
        onPress: () => {
          translateX.value = withSpring(0, IOSpringValues.accordion);
        },
        style: "cancel"
      },
      {
        text: alertProps.confirmText,
        style: "destructive",
        onPress: () => {
          translateX.value = withTiming(-500, { duration: 300 });
          swipeAction();
        }
      }
    ]);

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

  const handleGestureEvent = (
    event: GestureEvent<PanGestureHandlerEventPayload>
  ) => {
    const { translationX } = event.nativeEvent;

    if (translationX < 0) {
      const newTranslateX = gestureContext.current.startX + translationX;

      // Clamp value to avoid over-dragging
      translateX.value = Math.max(newTranslateX, -width * 0.9);

      // Set the open item reference
      if (openedItemRef?.current && openedItemRef.current !== closeItem) {
        openedItemRef.current();
      }
      if (openedItemRef) {
        openedItemRef.current = closeItem;
      }
    }

    if (translationX < -200 && !hapticTriggered.current) {
      HapticFeedback.trigger("impactLight");
      hapticTriggered.current = true;
    } else if (translationX >= -200) {
      hapticTriggered.current = false;
    }
  };

  const handleGestureEnd = (
    event: HandlerStateChangeEvent<PanGestureHandlerEventPayload>
  ) => {
    const { translationX, velocityX } = event.nativeEvent;

    if (translationX < -200 || velocityX < -800) {
      showAlertAction();
    } else {
      translateX.value = withSpring(
        translationX < -50 ? -60 : 0,
        IOSpringValues.accordion
      );
    }
  };

  const closeItem = () => {
    translateX.value = withSpring(0, IOSpringValues.accordion);
  };

  // Close the item when the component is unmounted
  // or when the screen is focused
  // to avoid the item being open when navigating back
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
      <ContentWrapper
        style={{
          flex: 1,
          position: "relative"
        }}
      >
        <Animated.View
          style={[StyleSheet.absoluteFillObject, backgroundStyle]}
        />
        <RightActions
          icon={icon}
          color={color}
          backgroundColor={backgroundStyle.backgroundColor}
          translateX={translateX}
          showDeleteAlert={showAlertAction}
          accessibilityLabel={accessibilityLabel}
        />
        <PanGestureHandler
          // This is the minimum distance to drag before the gesture is recognized
          // We need it to be able to scroll the list
          activeOffsetX={[-10, 10]} // Require a small horizontal drag to activate
          failOffsetY={[-5, 5]} // Fail if vertical drag is more than 5px
          onGestureEvent={handleGestureEvent}
          onBegan={() => {
            gestureContext.current.startX = translateX.value;
          }}
          onEnded={event =>
            handleGestureEnd(
              event as HandlerStateChangeEvent<PanGestureHandlerEventPayload>
            )
          }
        >
          <Animated.View
            style={[
              {
                flex: 1,
                backgroundColor,
                // for swipe actions visual effect
                marginHorizontal: IOVisualCostants.appMarginDefault * -1
              },
              animatedStyle
            ]}
          >
            <ContentWrapper>{children}</ContentWrapper>
          </Animated.View>
        </PanGestureHandler>
      </ContentWrapper>
    </GestureHandlerRootView>
  );
};

export default ListItemSwipeAction;
