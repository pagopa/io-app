import { AccessibilityRole, StyleSheet, View } from "react-native";
import React from "react";
import { WithTestID } from "../../types/WithTestID";
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

type Props = WithTestID<{
  accessibilityHint?: string;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  backgroundColor: string;
  iconColor: string;
  iconName: string;
  viewRef: React.RefObject<View>;
}>;

const StatusContent: React.FC<Props> = ({
  accessibilityHint,
  accessibilityLabel,
  accessibilityRole,
  backgroundColor,
  children,
  iconColor,
  iconName,
  viewRef
}) => (
  <View
    accessibilityHint={accessibilityHint}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole={accessibilityRole}
    accessible={true}
    ref={viewRef}
    style={[styles.container, { backgroundColor }]}
    testID={"SectionStatusContent"}
  >
    <IconFont
      color={iconColor}
      name={iconName}
      size={iconSize}
      style={styles.alignCenter}
    />
    <Label color={"white"} style={styles.text} weight={"Regular"}>
      {children}
    </Label>
  </View>
);

export default StatusContent;
