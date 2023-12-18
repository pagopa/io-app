import React, { ComponentProps, forwardRef } from "react";
import { AccessibilityRole, StyleSheet, View } from "react-native";
import {
  FontSize,
  IOColors,
  IOIcons,
  Icon
} from "@pagopa/io-app-design-system";
import { WithTestID } from "../../types/WithTestID";
import { Label } from "../core/typography/Label";

const iconSize = 24;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "100%",
    paddingLeft: 24,
    paddingRight: 24,
    paddingBottom: 8,
    paddingTop: 8,
    alignItems: "flex-start",
    alignContent: "center"
  },
  alignCenter: { alignSelf: "center" },
  text: { marginLeft: 16, flex: 1 }
});

type Props = WithTestID<{
  accessible?: boolean;
  accessibilityHint?: string;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  backgroundColor: IOColors;
  iconName: IOIcons;
  fontSize?: FontSize;
  foregroundColor: ComponentProps<typeof Label>["color"];
  labelPaddingVertical?: number;
}>;

const StatusContent = forwardRef<View, React.PropsWithChildren<Props>>(
  (
    {
      accessible = true,
      backgroundColor,
      children,
      iconName,
      fontSize,
      foregroundColor,
      labelPaddingVertical,
      ...rest
    },
    ref
  ) => (
    <View
      {...rest}
      ref={ref}
      accessible={accessible}
      style={[styles.container, { backgroundColor: IOColors[backgroundColor] }]}
      testID={"SectionStatusContent"}
    >
      <View style={styles.alignCenter}>
        <Icon color={foregroundColor} name={iconName} size={iconSize} />
      </View>
      <Label
        color={foregroundColor}
        fontSize={fontSize}
        style={[
          styles.text,
          labelPaddingVertical ? { paddingVertical: labelPaddingVertical } : {}
        ]}
        weight={"Regular"}
      >
        {children}
      </Label>
    </View>
  )
);

export default StatusContent;
