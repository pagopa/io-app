import React from "react";
import {
  DeviceEventEmitter,
  FlatList,
  SafeAreaView,
  StyleSheet,
  View
} from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes
} from "react-native-haptic-feedback";
import Animated, {
  Easing,
  SlideInUp,
  SlideOutUp
} from "react-native-reanimated";
import { IOIcons, Icon } from "../core/icons";
import { CTA } from "../core/typography/CTA";
import { IOColors } from "../core/variables/IOColors";
import { IOAlertRadius } from "../core/variables/IOShapes";

type ToastVariant = "neutral" | "error" | "info" | "success" | "warning";

type Toast = {
  message: string;
  variant?: ToastVariant;
  icon?: IOIcons;
};

type ToastColors = {
  background: IOColors;
  stroke: IOColors;
};

const toastVariantToColors: Record<ToastVariant, ToastColors> = {
  neutral: {
    background: "turquoise-150",
    stroke: "turquoise-850"
  },
  error: {
    background: "error-100",
    stroke: "error-850"
  },
  info: {
    background: "info-100",
    stroke: "info-850"
  },
  success: {
    background: "success-100",
    stroke: "success-850"
  },
  warning: {
    background: "warning-100",
    stroke: "warning-850"
  }
};

const ToastNotification = ({ message, variant = "neutral", icon }: Toast) => {
  const colors = toastVariantToColors[variant];

  return (
    <View
      style={[
        styles.toast,
        {
          backgroundColor: IOColors[colors.background],
          borderColor: IOColors[colors.stroke]
        }
      ]}
    >
      <CTA color={colors.stroke} style={styles.content}>
        {message}
      </CTA>
      {icon && <Icon name={icon} size={24} color={colors.stroke} />}
    </View>
  );
};

/**
 * The event name used to show a toast notification
 */
const TOAST_EVENT = "SHOW_TOAST";

/**
 * The maximum number of toasts that can be displayed at the same time
 * If the number of the toasts exceeds this number, the oldest one will be removed
 */
const MAX_TOAST_STACK_SIZE = 3;

/**
 * The time in milliseconds that a toast notification will be displayed
 */
const TOAST_DURATION_TIME = 5000;

/**
 * Toast type with an ID to be used as key in the list
 */
type UIToast = { id: number } & Toast;

/**
 * Map a toast variant to a haptic feedback type
 */
const variantToHapticFeedback: Partial<
  Record<ToastVariant, HapticFeedbackTypes>
> = {
  error: HapticFeedbackTypes.notificationError,
  info: HapticFeedbackTypes.impactMedium,
  success: HapticFeedbackTypes.notificationSuccess,
  warning: HapticFeedbackTypes.notificationWarning
};

type AnimatedToast = {
  onClose?: () => void;
} & Toast;

const AnimatedToastNotification = (props: AnimatedToast) => (
  <Animated.View
    entering={SlideInUp.duration(300).easing(Easing.inOut(Easing.exp))}
    exiting={SlideOutUp.duration(300).easing(Easing.inOut(Easing.exp))}
  >
    <Swipeable
      containerStyle={{ overflow: "visible" }}
      renderLeftActions={() => <View style={{ width: 100 }} />}
      onSwipeableWillOpen={props.onClose}
    >
      <ToastNotification {...props} />
    </Swipeable>
  </Animated.View>
);

const ToastNotificationContainer = () => {
  const [toasts, setToasts] = React.useState<ReadonlyArray<UIToast>>([]);

  const handleToastEvent = (toast: Toast) => {
    const id = new Date().getTime();

    setToasts(prevToasts => [{ ...toast, id }, ...prevToasts]);
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(t => t.id !== id));
    }, TOAST_DURATION_TIME);

    const hapticFeedback = variantToHapticFeedback[toast.variant || "neutral"];
    if (hapticFeedback) {
      ReactNativeHapticFeedback.trigger(hapticFeedback);
    }
  };

  const removeToastById = (id: number) => {
    setToasts(prevToasts => prevToasts.filter(t => t.id !== id));
  };

  const removeToastAtIndex = (index: number) => {
    setToasts(prevToasts => [
      ...prevToasts.slice(0, index),
      ...prevToasts.slice(index + 1)
    ]);
  };

  // If stack size exceed the maximum, remove the oldest toast
  React.useEffect(() => {
    if (toasts.length > MAX_TOAST_STACK_SIZE) {
      removeToastAtIndex(0);
    }
  }, [toasts]);

  /**
   * Subscribe to the toast event and add the new toast to the list
   */
  React.useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      TOAST_EVENT,
      handleToastEvent
    );
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container} pointerEvents="box-none">
      <View>
        <FlatList
          scrollEnabled={false}
          contentContainerStyle={styles.listContainer}
          style={styles.list}
          data={toasts}
          renderItem={({ item }) => (
            <AnimatedToastNotification
              key={item.id}
              {...item}
              onClose={() => removeToastById(item.id)}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    overflow: "visible"
  },
  listContainer: {
    padding: 24
  },
  list: {
    overflow: "visible"
  },
  toast: {
    borderRadius: IOAlertRadius,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },
  content: {
    paddingVertical: 2
  }
});

const IOToast = {
  /**
   * Show a toast notification with the given message, variant and icon
   * @param message The message to display
   * @param variant A {@link ToastVariant} of the toast that will determine its colors, defaults to "neutral"
   * @param icon An optional {@link IOIcons} to display on the right of the toast
   */
  show: (message: string, variant?: ToastVariant, icon?: IOIcons) => {
    DeviceEventEmitter.emit(TOAST_EVENT, {
      message,
      variant,
      icon
    });
  },
  /**
   * Show an error toast notification with the given message and an error icon
   * @param message The message to display
   */
  error: (message: string) => {
    IOToast.show(message, "error", "errorFilled");
    ReactNativeHapticFeedback.trigger("notificationError");
  },
  /**
   * Show an info toast notification with the given message and an info icon
   * @param message The message to display
   */
  info: (message: string) => {
    IOToast.show(message, "info", "infoFilled");
    ReactNativeHapticFeedback.trigger("impactMedium");
  },
  /**
   * Show a success toast notification with the given message and a check tick icon
   * @param message The message to display
   */
  success: (message: string) => {
    IOToast.show(message, "success", "success");
    ReactNativeHapticFeedback.trigger("notificationSuccess");
  },
  /**
   * Show a warning toast notification with the given message and a warning sign icon
   * @param message The message to display
   */
  warning: (message: string) => {
    IOToast.show(message, "warning", "warningFilled");
    ReactNativeHapticFeedback.trigger("notificationWarning");
  }
};

export { IOToast, ToastNotification, ToastNotificationContainer };
