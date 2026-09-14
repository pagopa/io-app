import { HapticType } from "../../functions";
import { IOIcons } from "../icons";

export type Toast = {
  hapticFeedback?: HapticType;
  icon?: IOIcons;
  message: string;
  variant?: ToastVariant;
};

export type ToastOptions = Omit<Toast, "message">;

export type ToastVariant = "error" | "info" | "neutral" | "success" | "warning";
