import { createContext } from "react";
import { Toast } from "./types";

export type ToastContext = {
  addToast: (props: Toast) => number;
  removeToast: (id: number) => void;
  removeAllToasts: () => void;
};

export const ToastContext = createContext<ToastContext>({
  addToast: () => 0,
  removeToast: () => undefined,
  removeAllToasts: () => undefined
});
