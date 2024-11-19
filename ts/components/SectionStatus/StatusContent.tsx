import {
  Body,
  IOColors,
  IOFontSize,
  IOIcons,
  Icon
} from "@pagopa/io-app-design-system";
import React, { ComponentProps, forwardRef } from "react";
import { AccessibilityRole, StyleSheet, View } from "react-native";
import { LevelEnum } from "../../../definitions/content/SectionStatus";
import { WithTestID } from "../../types/WithTestID";

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
  fontSize?: IOFontSize;
  foregroundColor: ComponentProps<typeof Body>["color"];
  labelPaddingVertical?: number;
}>;

export const statusColorMap: Record<LevelEnum, IOColors> = {
  [LevelEnum.normal]: "aqua",
  [LevelEnum.critical]: "red",
  [LevelEnum.warning]: "orange"
};

export const statusIconMap: Record<LevelEnum, IOIcons> = {
  [LevelEnum.normal]: "ok",
  [LevelEnum.critical]: "notice",
  [LevelEnum.warning]: "info"
};

// map the text background color with the relative text color
export const getStatusTextColor = (level: LevelEnum): "grey-700" | "white" =>
  level === LevelEnum.normal ? "grey-700" : "white";

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
      <Body
        color={foregroundColor}
        style={StyleSheet.flatten([
          styles.text,
          labelPaddingVertical ? { paddingVertical: labelPaddingVertical } : {}
        ])}
      >
        {children}
      </Body>
    </View>
  )
);

export default StatusContent;
