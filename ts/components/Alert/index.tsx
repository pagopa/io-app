import {
  AccessibilityRole,
  GestureResponderEvent,
  StyleSheet,
  View
} from "react-native";
import React from "react";
import { WithTestID } from "../../types/WithTestID";
import { Label } from "../core/typography/Label";
import { Link } from "../core/typography/Link";
import {
  IOColors,
  IOColorsStatusBackground,
  IOColorsStatusForeground
} from "../core/variables/IOColors";
import { Icon, IOIconType } from "../core/icons";
import { HSpacer, VSpacer } from "../core/spacer/Spacer";
import { H2 } from "../core/typography/H2";
import { IOStyles } from "../core/variables/IOStyles";
import { IOAlertRadius } from "../core/variables/IOShapes";
import { IOAlertSpacing } from "../core/variables/IOSpacing";

const iconSize = 24;
const [spacingDefault, spacingFullWidth] = IOAlertSpacing;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    alignContent: "center"
  },
  spacingDefault: {
    padding: spacingDefault,
    borderRadius: IOAlertRadius
  },
  spacingFullWidth: {
    padding: spacingFullWidth
  }
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
  background: IOColorsStatusBackground;
  foreground: IOColorsStatusForeground;
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
  viewRef,
  variant,
  title,
  content,
  action,
  onPress,
  fullWidth = false,
  accessible,
  accessibilityHint,
  accessibilityLabel,
  accessibilityRole,
  testID
}: Props) => (
  <View
    ref={viewRef}
    style={[
      styles.container,
      fullWidth ? styles.spacingFullWidth : styles.spacingDefault,
      { backgroundColor: IOColors[mapVariantStates[variant].background] }
    ]}
    testID={testID}
    accessibilityHint={accessibilityHint}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole={accessibilityRole}
    accessible={accessible ?? true}
  >
    <Icon
      name={mapVariantStates[variant].icon}
      size={iconSize}
      color={mapVariantStates[variant].foreground}
    />
    <HSpacer />
    <View style={IOStyles.flex}>
      {title && (
        <>
          <H2 weight="SemiBold" color={mapVariantStates[variant].foreground}>
            {title}
          </H2>
          <VSpacer size={4} />
        </>
      )}
      <Label color={mapVariantStates[variant].foreground} weight={"Regular"}>
        {content}
      </Label>
      {action && (
        <>
          <VSpacer size={4} />
          <Link
            color={mapVariantStates[variant].foreground}
            onPress={onPress}
            style={{ alignSelf: "flex-start" }}
          >
            {action}
          </Link>
        </>
      )}
    </View>
  </View>
);
