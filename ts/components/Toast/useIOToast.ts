import React, { MutableRefObject } from "react";
import { ToastOptions } from "./types";
import { ToastContext } from "./context";

export const useIOToast = () => {
  const { addToast, removeToast, removeAllToasts } =
    React.useContext(ToastContext);

  const show = React.useCallback(
    (message: string, options?: ToastOptions) => {
      addToast({ message, ...options });
    },
    [addToast]
  );

  const error = React.useCallback(
    (message: string) => {
      show(message, {
        variant: "error",
        icon: "errorFilled",
        hapticFeedback: "notificationError"
      });
    },
    [show]
  );

  const info = React.useCallback(
    (message: string) => {
      show(message, {
        variant: "info",
        icon: "infoFilled",
        hapticFeedback: "impactMedium"
      });
    },
    [show]
  );

  const success = React.useCallback(
    (message: string) => {
      show(message, {
        variant: "success",
        icon: "success",
        hapticFeedback: "notificationSuccess"
      });
    },
    [show]
  );

  const warning = React.useCallback(
    (message: string) => {
      show(message, {
        variant: "warning",
        icon: "warningFilled",
        hapticFeedback: "notificationWarning"
      });
    },
    [show]
  );

  return React.useMemo(
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

export const IOToastRef =
  React.createRef<IOToast>() as MutableRefObject<IOToast>;

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
