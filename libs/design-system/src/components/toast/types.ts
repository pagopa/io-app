import { HapticFeedbackTypes } from "react-native-haptic-feedback";

import { IOIcons } from "../icons";

export type Toast = {
  hapticFeedback?: keyof typeof HapticFeedbackTypes;
  icon?: IOIcons;
  message: string;
  variant?: ToastVariant;
};

export type ToastOptions = Omit<Toast, "message">;

export type ToastVariant = "error" | "info" | "neutral" | "success" | "warning";
