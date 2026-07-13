import { createRef, RefObject, useCallback, useContext, useMemo } from "react";
import { ToastContext } from "./context";
import { ToastOptions } from "./types";

export const useIOToast = () => {
  const { addToast, removeToast, removeAllToasts } = useContext(ToastContext);

  const show = useCallback(
    (message: string, options?: ToastOptions) => {
      addToast({ message, ...options });
    },
    [addToast]
  );

  const error = useCallback(
    (message: string) => {
      show(message, {
        variant: "error",
        icon: "errorFilled",
        hapticFeedback: "notificationError"
      });
    },
    [show]
  );

  const info = useCallback(
    (message: string) => {
      show(message, {
        variant: "info",
        icon: "infoFilled",
        hapticFeedback: "impactMedium"
      });
    },
    [show]
  );

  const success = useCallback(
    (message: string) => {
      show(message, {
        variant: "success",
        icon: "success",
        hapticFeedback: "notificationSuccess"
      });
    },
    [show]
  );

  const warning = useCallback(
    (message: string) => {
      show(message, {
        variant: "warning",
        icon: "warningFilled",
        hapticFeedback: "notificationWarning"
      });
    },
    [show]
  );

  return useMemo(
    () => ({
      show,
      error,
      info,
      success,
      warning,
      hide: removeToast,
      hideAll: removeAllToasts
    }),
    [show, error, info, success, warning, removeToast, removeAllToasts]
  );
};

export type IOToast = ReturnType<typeof useIOToast>;

export const IOToastRef = createRef<IOToast>() as RefObject<IOToast>;

export const IOToast: IOToast = {
  show: (message: string, options?: ToastOptions) =>
    IOToastRef.current?.show(message, options),
  error: (message: string) => IOToastRef.current?.error(message),
  warning: (message: string) => IOToastRef.current?.warning(message),
  success: (message: string) => IOToastRef.current?.success(message),
  info: (message: string) => IOToastRef.current?.info(message),
  hideAll: () => IOToastRef.current?.hideAll(),
  hide: (id: number) => IOToastRef.current?.hide(id)
};
