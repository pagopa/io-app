import {
  AccessibilityRole,
  GestureResponderEvent,
  StyleSheet,
  View
} from "react-native";
import React from "react";
import { WithTestID } from "../../types/WithTestID";
import { Label } from "../core/typography/Label";
import { IOColors, IOColorsStatus } from "../core/variables/IOColors";
import { Icon, IOIconType } from "../core/icons";
import { HSpacer } from "../core/spacer/Spacer";

const iconSize = 24;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    alignContent: "center"
  },
  spacingDefault: {
    padding: 16,
    borderRadius: 8
  },
  spacingFullWidth: {
    padding: 24
  },
  text: { flex: 1 }
});

type Props = WithTestID<{
  variant: "error" | "warning" | "info" | "success";
  title?: string;
  content: string;
  action?: string;
  onPress?: (event: GestureResponderEvent) => void;
  fullWidth?: boolean;
  viewRef: React.RefObject<View>;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
}>;

type VariantStates = {
  icon: IOIconType;
  background: IOColorsStatus;
  foreground: IOColorsStatus;
};

// COMPONENT CONFIGURATION

const mapVariantStates: Record<NonNullable<Props["variant"]>, VariantStates> = {
  error: {
    icon: "errorFilled",
    background: "errorLight",
    foreground: "errorDark"
  },
  warning: {
    icon: "warningFilled",
    background: "warningLight",
    foreground: "warningDark"
  },
  info: {
    icon: "infoFilled",
    background: "infoLight",
    foreground: "infoDark"
  },
  success: {
    icon: "success",
    background: "successLight",
    foreground: "successDark"
  }
};

export const Alert = ({
  variant,
  content,
  fullWidth = false,
  accessible,
  accessibilityHint,
  accessibilityLabel,
  accessibilityRole,
  viewRef
}: Props) => (
  <View
    accessibilityHint={accessibilityHint}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole={accessibilityRole}
    accessible={accessible ?? true}
    ref={viewRef}
    style={[
      styles.container,
      fullWidth ? styles.spacingFullWidth : styles.spacingDefault,
      { backgroundColor: IOColors[mapVariantStates[variant].background] }
    ]}
    testID={"SectionStatusContent"}
  >
    <Icon
      name={mapVariantStates[variant].icon}
      size={iconSize}
      color={mapVariantStates[variant].foreground}
    />
    <HSpacer />
    <View style={styles.text}>
      <Label color={mapVariantStates[variant].foreground} weight={"Regular"}>
        {content}
      </Label>
    </View>
  </View>
);
