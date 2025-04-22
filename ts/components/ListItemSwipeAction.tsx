/* eslint-disable functional/immutable-data */
import { IconButton, IOColors } from "@pagopa/io-app-design-system";
import { Alert, StyleSheet, View } from "react-native";
import {
  GestureEvent,
  GestureHandlerRootView,
  HandlerStateChangeEvent,
  PanGestureHandler,
  PanGestureHandlerEventPayload
} from "react-native-gesture-handler";
import Reanimated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";

const RightActions = ({ showDeleteAlert }: { showDeleteAlert: () => void }) => (
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
      accessibilityLabel="Delete item"
      icon="eyeHide"
      color="contrast"
      onPress={showDeleteAlert}
    />
  </View>
);

type ListItemSwipeActionProps = {
  children: React.ReactNode;
  onDelete?: () => void;
};

const ListItemSwipeAction = ({
  children,
  onDelete
}: ListItemSwipeActionProps) => {
  const translateX = useSharedValue(0);

  // Function to show the delete confirmation alert
  const showDeleteAlert = () => {
    Alert.alert(
      "Conferma eliminazione",
      "Sei sicuro di voler eliminare questo elemento?",
      [
        {
          text: "No",
          onPress: () => {
            translateX.value = withSpring(0);
          },
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: () => {
            translateX.value = withTiming(-500, { duration: 300 }, () => {
              if (onDelete) {
                onDelete();
              }
            });
          }
        }
      ]
    );
  };

  // Animated style for the background
  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      translateX.value,
      [-500, -100, 0],
      [IOColors["blueIO-500"], IOColors["blueIO-500"], IOColors.white]
    )
  }));

  // Animated style for the content
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
      // Show delete confirmation alert
      showDeleteAlert();
    } else if (translationX < -50) {
      // Partial swipe
      translateX.value = withSpring(-60);
    } else {
      // Reset swipe
      translateX.value = withSpring(0);
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
        <Reanimated.View
          style={[
            {
              ...StyleSheet.absoluteFillObject,
              backgroundColor: IOColors.white
            },
            backgroundStyle
          ]}
        />
        <RightActions showDeleteAlert={showDeleteAlert} />
        <PanGestureHandler
          onGestureEvent={handleGestureEvent}
          onEnded={event =>
            handleGestureEnd(
              event as HandlerStateChangeEvent<PanGestureHandlerEventPayload>
            )
          }
        >
          <Reanimated.View
            style={[
              {
                flex: 1,
                backgroundColor: IOColors.white // Ensure the content remains white
              },
              animatedStyle
            ]}
          >
            {children}
          </Reanimated.View>
        </PanGestureHandler>
      </View>
    </GestureHandlerRootView>
  );
};

export default ListItemSwipeAction;
