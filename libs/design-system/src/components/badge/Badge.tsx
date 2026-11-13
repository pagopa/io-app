import { Platform, StyleSheet, View, ViewStyle } from "react-native";

import { useIOColors } from "../../context";
import { IODimensions } from "../../core";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { IOText } from "../typography";

export type Badge = WithTestID<{
  accessible?: boolean;
  allowFontScaling?: boolean;
  outline?: boolean;
  text: string;
  variant: "cgn" | "default" | "error" | "highlight" | "success" | "warning";
}>;

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderCurve: "continuous",
    ...Platform.select({
      android: {
        textAlignVertical: "center"
      }
    })
  },
  badgeStaticStyle: {
    borderRadius: IODimensions.radius.badge,
    paddingHorizontal: IODimensions.padding.badge.horizontal,
    paddingVertical: IODimensions.padding.badge.vertical
  }
});

/** Official badge component */
export const Badge = ({
  text,
  outline = false,
  allowFontScaling = true,
  variant,
  accessible = true,
  testID
}: Badge) => {
  const { dynamicFontScale } = useIOFontDynamicScale();
  const colors = useIOColors();
  const badgeColors = colors.component.badge[variant];
  /* The outline variant uses it for the border too */
  const foreground = badgeColors.foreground.default;

  const dynamicStyle: ViewStyle = {
    borderRadius: IODimensions.radius.badge * dynamicFontScale,
    paddingHorizontal: IODimensions.padding.badge.horizontal * dynamicFontScale,
    paddingVertical: IODimensions.padding.badge.vertical * dynamicFontScale
  };

  return (
    <View
      accessible={accessible}
      style={[
        styles.badge,
        allowFontScaling ? dynamicStyle : styles.badgeStaticStyle,
        outline
          ? {
              borderWidth: IODimensions.stroke.default,
              borderColor: foreground
            }
          : { backgroundColor: badgeColors.background.default }
      ]}
      testID={testID}
    >
      <IOText
        allowFontScaling={allowFontScaling}
        color={foreground}
        ellipsizeMode="tail"
        lineHeight={16}
        numberOfLines={1}
        size={12}
        style={{
          alignSelf: "center",
          textTransform: "uppercase",
          letterSpacing: 0.5
        }}
        weight={"Semibold"}
      >
        {text}
      </IOText>
    </View>
  );
};
