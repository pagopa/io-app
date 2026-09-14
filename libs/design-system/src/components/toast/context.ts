import { createContext } from "react";

import { Toast } from "./types";

export type ToastContext = {
  addToast: (props: Toast) => number;
  removeAllToasts: () => void;
  removeToast: (id: number) => void;
};

export const ToastContext = createContext<ToastContext>({
  addToast: () => 0,
  removeToast: () => undefined,
  removeAllToasts: () => undefined
});
