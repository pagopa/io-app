import { AccessibilityRole, StyleSheet, View } from "react-native";
import React from "react";
import IconFont from "../ui/IconFont";
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

type Props = {
  accessibilityLabel: string;
  accessibilityRole?: AccessibilityRole;
  backgroundColor: string;
  iconColor: string;
  iconName: string;
  viewRef: React.RefObject<View>;
};
const StatusContent: React.FC<Props> = ({
  accessibilityLabel,
  accessibilityRole,
  backgroundColor,
  children,
  iconColor,
  iconName,
  viewRef
}) => (
  <View
    style={[styles.container, { backgroundColor }]}
    accessible={true}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole={accessibilityRole}
    ref={viewRef}
  >
    <IconFont
      testID={"SectionStatusComponentIcon"}
      name={iconName}
      size={iconSize}
      color={iconColor}
      style={styles.alignCenter}
    />
    <Label
      color={"white"}
      style={styles.text}
      weight={"Regular"}
      testID={"SectionStatusComponentLabel"}
    >
      {children}
    </Label>
  </View>
);

export default StatusContent;
