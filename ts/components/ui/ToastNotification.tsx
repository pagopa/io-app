import React from "react";
import {
  DeviceEventEmitter,
  SafeAreaView,
  StyleSheet,
  View
} from "react-native";
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes
} from "react-native-haptic-feedback";
import Animated, {
  Easing,
  SequencedTransition,
  SlideInUp,
  SlideOutUp
} from "react-native-reanimated";
import { IOIcons, Icon } from "../core/icons";
import { CTA } from "../core/typography/CTA";
import { IOColors } from "../core/variables/IOColors";
import { IOAlertRadius } from "../core/variables/IOShapes";
import { Dismissable } from "./Dismissable";

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
      accessible={true}
      accessibilityRole={"alert"}
      accessibilityLabel={message}
    >
      <CTA color={colors.stroke} style={styles.content}>
        {message}
      </CTA>
      {icon && <Icon name={icon} size={24} color={colors.stroke} />}
    </View>
  );
};

/**
 * The event used to show a toast notification
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
type ToastNotificationStackItem = Toast & { id: number };

type ToastNotificationStackItemProps = ToastNotificationStackItem & {
  onDismiss: () => void;
};

/**
 * A toast notification item that can be swiped to the right to dismiss it, with enter and exit animations
 */
const ToastNotificationStackItem = ({
  onDismiss,
  ...props
}: ToastNotificationStackItemProps) => (
  <Animated.View
    entering={SlideInUp.duration(300).easing(Easing.inOut(Easing.exp))}
    exiting={SlideOutUp.duration(300).easing(Easing.inOut(Easing.exp))}
    layout={SequencedTransition.duration(300)}
    style={{ paddingBottom: 8 }}
  >
    <Dismissable onDismiss={onDismiss}>
      <ToastNotification {...props} />
    </Dismissable>
  </Animated.View>
);

/**
 * Toast events payload
 */
type ToastEvent = Toast & {
  hapticFeedback?: keyof typeof HapticFeedbackTypes;
};

/**
 * A container that will display the toast notifications received by the {@link TOAST_EVENT} event
 */
const ToastNotificationContainer = () => {
  const [toasts, setToasts] = React.useState<
    ReadonlyArray<ToastNotificationStackItem>
  >([]);

  const handleToastEvent = (toast: ToastEvent) => {
    const id = new Date().getTime();

    setToasts(prevToasts => [{ id, ...toast }, ...prevToasts]);
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(t => t.id !== id));
    }, TOAST_DURATION_TIME);

    if (toast.hapticFeedback) {
      ReactNativeHapticFeedback.trigger(toast.hapticFeedback);
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
      removeToastAtIndex(MAX_TOAST_STACK_SIZE);
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
      <View style={styles.list} pointerEvents="box-none">
        {toasts.map(toast => (
          <ToastNotificationStackItem
            key={toast.id}
            {...toast}
            onDismiss={() => removeToastById(toast.id)}
          />
        ))}
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
  list: {
    padding: 24
  },
  toast: {
    borderRadius: IOAlertRadius,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  content: {
    paddingVertical: 2
  }
});

/**
 * Options to customize the toast notification
 */
type IOToastOptions = Omit<ToastEvent, "message">;

/**
 * A toast notification service that can be used to show toast notifications
 */
const IOToast = {
  /**
   * Show a toast notification with the given message, variant and icon
   * @param message The message to display
   * @param variant A {@link ToastVariant} of the toast that will determine its colors, defaults to "neutral"
   * @param icon An optional {@link IOIcons} to display on the right of the toast
   *
   * @example
   *
   * IOToast.show("This is a toast notification", "info", "infoFilled");
   */
  show: (message: string, options?: IOToastOptions) => {
    DeviceEventEmitter.emit(TOAST_EVENT, {
      message,
      ...options
    });
  },
  /**
   * Show an error toast notification with the given message and an error icon
   * @param message The message to display
   *
   * @example
   *
   * IOToast.error("This is an error toast notification");
   */
  error: (message: string) => {
    IOToast.show(message, {
      variant: "error",
      icon: "errorFilled",
      hapticFeedback: "notificationError"
    });
  },
  /**
   * Show an info toast notification with the given message and an info icon
   * @param message The message to display
   *
   * @example
   *
   * IOToast.info("This is an info toast notification");
   */
  info: (message: string) => {
    IOToast.show(message, {
      variant: "info",
      icon: "infoFilled",
      hapticFeedback: "impactMedium"
    });
  },
  /**
   * Show a success toast notification with the given message and a check tick icon
   * @param message The message to display
   *
   * @example
   *
   * IOToast.success("This is a success toast notification");
   */
  success: (message: string) => {
    IOToast.show(message, {
      variant: "success",
      icon: "success",
      hapticFeedback: "notificationSuccess"
    });
  },
  /**
   * Show a warning toast notification with the given message and a warning sign icon
   * @param message The message to display
   *
   * @example
   *
   * IOToast.warning("This is a warning toast notification");
   */
  warning: (message: string) => {
    IOToast.show(message, {
      variant: "warning",
      icon: "warningFilled",
      hapticFeedback: "notificationWarning"
    });
  }
};

export { IOToast, ToastNotification, ToastNotificationContainer };
