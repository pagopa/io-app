import * as React from "react";
import { ComponentProps } from "react";
import LinearGradient from "react-native-linear-gradient";
import { View, StyleSheet } from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import customVariables from "../../../../../theme/variables";
import TouchableDefaultOpacity from "../../../../../components/TouchableDefaultOpacity";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { H2 } from "../../../../../components/core/typography/H2";
import { CATEGORY_GRADIENT_ANGLE } from "../../utils/filters";

type Props = {
  onPress?: () => void;
  title: string;
  colors: ComponentProps<typeof LinearGradient>["colors"];
  child?: React.ReactElement;
};

const styles = StyleSheet.create({
  body: {
    borderRadius: 8,
    marginBottom: 10,
    width: widthPercentageToDP("42.13%"),
    minHeight: 121
  },
  container: {
    flexDirection: "column",
    paddingHorizontal: customVariables.contentPadding / 2,
    paddingVertical: 14
  }
});

const CgnMerchantCategoryItem = (props: Props) => (
  <LinearGradient
    colors={props.colors}
    useAngle={true}
    angle={CATEGORY_GRADIENT_ANGLE}
    style={styles.body}
  >
    <TouchableDefaultOpacity
      accessibilityRole={"button"}
      style={[IOStyles.flex, styles.container]}
      onPress={props.onPress}
    >
      <View style={[IOStyles.flex, IOStyles.row]}>
        <H2 color={"white"}>{props.title}</H2>
      </View>
      {props.child}
    </TouchableDefaultOpacity>
  </LinearGradient>
);

export default CgnMerchantCategoryItem;
