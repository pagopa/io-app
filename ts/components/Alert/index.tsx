import { GestureResponderEvent, StyleSheet, View } from "react-native";
import React from "react";
import { WithTestID } from "../../types/WithTestID";
import { Label } from "../core/typography/Label";
import {
  IOColors,
  IOColorsStatusBackground,
  IOColorsStatusForeground
} from "../core/variables/IOColors";
import { IOIconSizeScale, IOIcons, Icon } from "../core/icons";
import { HSpacer, VSpacer } from "../core/spacer/Spacer";
import { IOStyles } from "../core/variables/IOStyles";
import { IOAlertRadius } from "../core/variables/IOShapes";
import { IOAlertSpacing } from "../core/variables/IOSpacing";
import { NewH4 } from "../core/typography/NewH4";
import ButtonLink from "../ui/ButtonLink";

const iconSize: IOIconSizeScale = 24;

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

type AlertProps = WithTestID<{
  variant: "error" | "warning" | "info" | "success";
  title?: string;
  content: string;
  fullWidth?: boolean;
  viewRef: React.RefObject<View>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}>;

type AlertActionProps =
  | {
      action?: string;
      onPress: (event: GestureResponderEvent) => void;
    }
  | {
      action?: never;
      onPress?: never;
    };

export type Alert = AlertProps & AlertActionProps;

type VariantStates = {
  icon: IOIcons;
  background: IOColorsStatusBackground;
  foreground: IOColorsStatusForeground;
};

// COMPONENT CONFIGURATION

const mapVariantStates: Record<NonNullable<Alert["variant"]>, VariantStates> = {
  error: {
    icon: "errorFilled",
    background: "error-100",
    foreground: "error-850"
  },
  warning: {
    icon: "warningFilled",
    background: "warning-100",
    foreground: "warning-850"
  },
  info: {
    icon: "infoFilled",
    background: "info-100",
    foreground: "info-850"
  },
  success: {
    icon: "success",
    background: "success-100",
    foreground: "success-850"
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
  accessibilityHint,
  testID
}: Alert) => (
  <View
    ref={viewRef}
    style={[
      styles.container,
      fullWidth ? styles.spacingFullWidth : styles.spacingDefault,
      { backgroundColor: IOColors[mapVariantStates[variant].background] }
    ]}
    testID={testID}
    accessible={false}
    accessibilityRole="alert"
    accessibilityHint={accessibilityHint}
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
          <NewH4 color={mapVariantStates[variant].foreground}>{title}</NewH4>
          <VSpacer size={8} />
        </>
      )}
      <Label
        color={mapVariantStates[variant].foreground}
        weight={"Regular"}
        accessibilityRole="text"
      >
        {content}
      </Label>
      {action && (
        <>
          <VSpacer size={8} />
          <ButtonLink color={variant} onPress={onPress} label={action} />
        </>
      )}
    </View>
  </View>
);
