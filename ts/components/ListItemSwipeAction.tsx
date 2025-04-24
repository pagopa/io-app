/* eslint-disable functional/immutable-data */
import {
  IconButton,
  IOColors,
  useIOThemeContext
} from "@pagopa/io-app-design-system";
import { Alert, StyleSheet, View } from "react-native";
import {
  GestureEvent,
  GestureHandlerRootView,
  HandlerStateChangeEvent,
  PanGestureHandler,
  PanGestureHandlerEventPayload
} from "react-native-gesture-handler";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";

type RightActionsProps = {
  showDeleteAlert: () => void;
  accessibilityLabel: string;
};

const RightActions = ({
  showDeleteAlert,
  accessibilityLabel
}: RightActionsProps) => (
  <View
    style={{
      backgroundColor: IOColors["blueIO-500"],
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
    <IconButton
      accessibilityLabel={accessibilityLabel}
      icon="eyeHide"
      color="contrast"
      onPress={showDeleteAlert}
    />
  </View>
);

type ListItemSwipeActionProps = {
  children: React.ReactNode;
  swipeAction: () => void;
  alertProps: {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
  };
  accessibilityLabel?: string;
};

const ListItemSwipeAction = ({
  children,
  swipeAction,
  alertProps,
  accessibilityLabel = ""
}: ListItemSwipeActionProps) => {
  const translateX = useSharedValue(0);
  const { theme } = useIOThemeContext();
  const backgroundColor = IOColors[theme["appBackground-primary"]];

  const showAlertAction = () =>
    Alert.alert(alertProps.title, alertProps.message, [
      {
        text: alertProps.cancelText,
        onPress: () => {
          translateX.value = withSpring(0);
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

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      translateX.value,
      [-500, -100, 0],
      [IOColors["blueIO-500"], IOColors["blueIO-500"], backgroundColor]
    )
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }));

  const handleGestureEvent = (
    event: GestureEvent<PanGestureHandlerEventPayload>
  ) => {
    const { translationX } = event.nativeEvent;
    if (translationX < 0) {
      translateX.value = translationX;
    }
  };

  const handleGestureEnd = (
    event: HandlerStateChangeEvent<PanGestureHandlerEventPayload>
  ) => {
    const { translationX, velocityX } = event.nativeEvent;

    if (translationX < -200 || velocityX < -800) {
      showAlertAction();
    } else {
      translateX.value = withSpring(translationX < -50 ? -60 : 0);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          position: "relative"
        }}
      >
        <Animated.View
          style={[
            {
              ...StyleSheet.absoluteFillObject,
              backgroundColor
            },
            backgroundStyle
          ]}
        />
        <RightActions
          showDeleteAlert={showAlertAction}
          accessibilityLabel={accessibilityLabel}
        />
        <PanGestureHandler
          onGestureEvent={handleGestureEvent}
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
                backgroundColor
              },
              animatedStyle
            ]}
          >
            {children}
          </Animated.View>
        </PanGestureHandler>
      </View>
    </GestureHandlerRootView>
  );
};

export default ListItemSwipeAction;
