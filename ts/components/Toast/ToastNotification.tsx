import React from "react";
import { StyleSheet, View } from "react-native";
import { IOColors, Icon, IOAlertRadius } from "@pagopa/io-app-design-system";
import { CTA } from "../core/typography/CTA";
import { Toast, ToastVariant } from "./types";

type ColorVariant = {
  background: IOColors;
  stroke: IOColors;
};

const toastColorVariants: Record<ToastVariant, ColorVariant> = {
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

type Props = Pick<Toast, "message" | "variant" | "icon">;

const ToastNotification = ({ message, variant = "neutral", icon }: Props) => {
  const colors = toastColorVariants[variant];

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

const styles = StyleSheet.create({
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

export { ToastNotification };
