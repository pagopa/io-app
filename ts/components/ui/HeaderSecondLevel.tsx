import * as React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle
} from "react-native-reanimated";
import I18n from "i18n-js";
import { IOColors, hexToRgba } from "../core/variables/IOColors";
import { WithTestID } from "../../types/WithTestID";
import { IOStyles, IOVisualCostants } from "../core/variables/IOStyles";
import { HSpacer } from "../core/spacer/Spacer";
import { makeFontStyleObject } from "../../components/core/fonts";
import IconButton from "./IconButton";

export type HeaderSecondLevel = WithTestID<{
  scrollValue: Animated.SharedValue<number>;
  title: string;
  // Accepted components: IconButton
  // Don't use any components other than this, please.
  firstAction?: React.ReactNode;
  secondAction?: React.ReactNode;
  thirdAction?: React.ReactNode;
}>;

const HEADER_BG_COLOR: IOColors = "white";
const borderColorDisabled = hexToRgba(IOColors["grey-100"], 0);
const scrollTriggerOffset: number = 50;

const styles = StyleSheet.create({
  headerInner: {
    backgroundColor: IOColors[HEADER_BG_COLOR],
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    height: IOVisualCostants.headerHeight,
    borderBottomWidth: 1,
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
});

export const HeaderSecondLevel = ({
  scrollValue,
  title,
  firstAction,
  secondAction,
  thirdAction,
  testID
}: HeaderSecondLevel) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const headerWrapperAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      scrollValue.value,
      [0, scrollTriggerOffset],
      [borderColorDisabled, IOColors["grey-100"]]
    )
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollValue.value, [0, scrollTriggerOffset], [0, 1])
  }));

  return (
    <Animated.View
      accessibilityRole="header"
      testID={testID}
      style={[
        { marginTop: insets.top },
        styles.headerInner,
        headerWrapperAnimatedStyle
      ]}
    >
      <IconButton
        icon={Platform.OS === "ios" ? "backiOS" : "backAndroid"}
        color="neutral"
        onPress={() => {
          navigation.goBack();
        }}
        accessibilityLabel={I18n.t("global.buttons.back")}
      />
      <Animated.Text
        style={[
          {
            ...makeFontStyleObject("Regular", false, "ReadexPro"),
            fontSize: 14,
            textAlign: "center",
            flexGrow: 1
          },
          titleAnimatedStyle
        ]}
      >
        {title}
      </Animated.Text>
      <View style={[IOStyles.row, { flexShrink: 0 }]}>
        {firstAction}
        {secondAction && (
          <>
            {/* Ideally, with the "gap" flex property,
              we can get rid of these ugly constructs */}
            <HSpacer size={16} />
            {secondAction}
          </>
        )}
        {thirdAction && (
          <>
            {/* Same as above */}
            <HSpacer size={16} />
            {thirdAction}
          </>
        )}
      </View>
    </Animated.View>
  );
};

export default HeaderSecondLevel;
