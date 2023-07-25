import { throttle } from "lodash";
import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import Animated, {
  Easing,
  SequencedTransition,
  SlideInUp,
  SlideOutUp
} from "react-native-reanimated";
import { Dismissable } from "../ui/Dismissable";
import { ToastNotification } from "./ToastNotification";
import { Toast } from "./types";
import { IOToastRef, useIOToast } from "./useIOToast";
import { ToastContext } from "./context";

/**
 * The maximum number of toasts that can be displayed at the same time
 * If the number of the toasts exceeds this number, the oldest one will be removed
 */
export const MAX_TOAST_STACK_SIZE = 3;

/**
 * The time in milliseconds that a toast notification will be displayed
 */
export const TOAST_DURATION_TIME = 5000;

/**
 * This is the time in milliseconds between two toast notifications.
 * This will throttle the toast notifications to avoid displaying too many of them at the same time
 * and causing visual glitches.
 */
export const TOAST_THROTTLE_TIME = 500;

type ToastNotificationStackItem = Toast & { id: number };
type ToastNotificationStackItemProps = ToastNotificationStackItem &
  Pick<Dismissable, "onDismiss">;

/**
 * A toast notification item that can be swiped to the right to dismiss it, with enter and exit animations
 */
const ToastNotificationStackItem = ({
  onDismiss,
  ...toast
}: ToastNotificationStackItemProps) => (
  <Animated.View
    entering={SlideInUp.duration(300).easing(Easing.inOut(Easing.exp))}
    exiting={SlideOutUp.duration(300).easing(Easing.inOut(Easing.exp))}
    layout={SequencedTransition.duration(300)}
    style={{ paddingBottom: 8 }}
  >
    <Dismissable onDismiss={onDismiss}>
      <ToastNotification {...toast} />
    </Dismissable>
  </Animated.View>
);

type ToastProviderProps = {
  children: React.ReactNode;
};

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const toastId = React.useRef(1);
  const [toasts, setToasts] = React.useState<
    ReadonlyArray<ToastNotificationStackItem>
  >([]);

  const addToast = React.useCallback((toast: Toast): number => {
    // eslint-disable-next-line functional/immutable-data
    const id = toastId.current++;
    setToasts(prevToasts => [{ id, ...toast }, ...prevToasts]);

    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(t => t.id !== id));
    }, TOAST_DURATION_TIME);

    if (toast.hapticFeedback) {
      ReactNativeHapticFeedback.trigger(toast.hapticFeedback);
    }

    return id;
  }, []);

  const removeToast = React.useCallback((id: number) => {
    setToasts(prevToasts => prevToasts.filter(t => t.id !== id));
  }, []);

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

  const removeAllToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue = React.useMemo(
    () => ({
      addToast: throttle(addToast, TOAST_THROTTLE_TIME),
      removeToast: throttle(removeToast, TOAST_THROTTLE_TIME),
      removeAllToasts
    }),
    [addToast, removeToast, removeAllToasts]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      <InitializeToastRef />
      <SafeAreaView style={styles.container} pointerEvents="box-none">
        <View style={styles.list} pointerEvents="box-none">
          {toasts.map(toast => (
            <ToastNotificationStackItem
              key={toast.id}
              {...toast}
              onDismiss={() => removeToast(toast.id)}
            />
          ))}
        </View>
      </SafeAreaView>
      {children}
    </ToastContext.Provider>
  );
};

const InitializeToastRef = () => {
  const toast = useIOToast();
  // eslint-disable-next-line functional/immutable-data
  IOToastRef.current = toast;
  return null;
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    overflow: "visible"
  },
  list: {
    padding: 24
  }
});
