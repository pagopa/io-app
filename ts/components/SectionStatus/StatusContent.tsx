import { AccessibilityRole, StyleSheet, View } from "react-native";
import React, { ComponentProps } from "react";
import { WithTestID } from "../../types/WithTestID";
import { Label } from "../core/typography/Label";
import { IOColors } from "../core/variables/IOColors";
import { IOIcons, Icon } from "../core/icons/Icon";

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
  viewRef: React.RefObject<View>;
  foregroundColor: ComponentProps<typeof Label>["color"];
  labelPaddingVertical?: number;
}>;

const StatusContent: React.FC<Props> = ({
  accessible,
  accessibilityHint,
  accessibilityLabel,
  accessibilityRole,
  backgroundColor,
  children,
  iconName,
  viewRef,
  foregroundColor,
  labelPaddingVertical
}) => (
  <View
    accessibilityHint={accessibilityHint}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole={accessibilityRole}
    accessible={accessible ?? true}
    ref={viewRef}
    style={[styles.container, { backgroundColor: IOColors[backgroundColor] }]}
    testID={"SectionStatusContent"}
  >
    <View style={styles.alignCenter}>
      <Icon color={foregroundColor} name={iconName} size={iconSize} />
    </View>
    <Label
      color={foregroundColor}
      style={[
        styles.text,
        labelPaddingVertical ? { paddingVertical: labelPaddingVertical } : {}
      ]}
      weight={"Regular"}
    >
      {children}
    </Label>
  </View>
);

export default StatusContent;
