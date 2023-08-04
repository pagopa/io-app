import { HapticFeedbackTypes } from "react-native-haptic-feedback";
import { IOIcons } from "@pagopa/io-app-design-system";

export type ToastVariant = "neutral" | "error" | "info" | "success" | "warning";

export type Toast = {
  message: string;
  variant?: ToastVariant;
  icon?: IOIcons;
  hapticFeedback?: keyof typeof HapticFeedbackTypes;
};

export type ToastOptions = Omit<Toast, "message">;
