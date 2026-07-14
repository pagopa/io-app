import { ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  SequencedTransition,
  SlideInUp,
  SlideOutUp
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { IOVisualCostants } from "../../core";
import { triggerHaptic } from "../../functions";
import { throttle } from "../../utils/throttle";
import { Dismissable } from "../templates";
import { ToastNotification } from "./ToastNotification";
import { ToastContext } from "./context";
import { Toast } from "./types";
import { IOToastRef, useIOToast } from "./useIOToast";

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
    entering={SlideInUp.springify().damping(16).mass(0.9).stiffness(90)}
    exiting={SlideOutUp.duration(700).easing(Easing.inOut(Easing.exp))}
    layout={SequencedTransition.duration(500).delay(50)}
    style={{ paddingBottom: 8 }}
  >
    <Dismissable onDismiss={onDismiss}>
      <ToastNotification {...toast} />
    </Dismissable>
  </Animated.View>
);

type ToastProviderProps = {
  children: ReactNode;
};

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const toastId = useRef(1);
  const [toasts, setToasts] = useState<
    ReadonlyArray<ToastNotificationStackItem>
  >([]);

  const addToast = useCallback((toast: Toast): number => {
    const id = (toastId.current ?? 0) + 1;
    // eslint-disable-next-line functional/immutable-data
    toastId.current = id;
    setToasts(prevToasts => {
      if (prevToasts.length >= MAX_TOAST_STACK_SIZE) {
        const mostRecentToasts = prevToasts.slice(0, -1);
        return [{ id, ...toast }, ...mostRecentToasts];
      }

      return [{ id, ...toast }, ...prevToasts];
    });

    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(t => t.id !== id));
    }, TOAST_DURATION_TIME);

    if (toast.hapticFeedback) {
      triggerHaptic(toast.hapticFeedback);
    }

    AccessibilityInfo.announceForAccessibilityWithOptions(toast.message, {
      queue: true
    });

    return id;
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prevToasts => prevToasts.filter(t => t.id !== id));
  }, []);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue = useMemo(
    () => ({
      addToast: throttle(addToast, TOAST_THROTTLE_TIME),
      removeToast: throttle(removeToast, TOAST_THROTTLE_TIME),
      removeAllToasts
    }),
    [addToast, removeToast, removeAllToasts]
  );

  return (
    <ToastContext.Provider value={contextValue as ToastContext}>
      <InitializeToastRef />
      <SafeAreaView style={styles.container} pointerEvents="box-none">
        <View
          style={{ padding: IOVisualCostants.appMarginDefault }}
          pointerEvents="box-none"
        >
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
  }
});
