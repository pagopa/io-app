import * as React from "react";
import { StyleSheet, View } from "react-native";
import IconFont from "../../components/ui/IconFont";
import customVariables from "../../theme/variables";

type Props = {
  checked: boolean;
};

const checkBoxColor = "#039BE5";
const transparentColor = "transparent";
const checkBoxIcon = "io-tick-big";

const styles = StyleSheet.create({
  base: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderColor: checkBoxColor,
    borderWidth: 2
  }
});

export const IngressCheckBox = (props: Props) => {
  const checkboxBackgroundColor = props.checked
    ? checkBoxColor
    : transparentColor;

  return (
    <View style={[styles.base, { backgroundColor: checkboxBackgroundColor }]}>
      {props.checked && (
        <IconFont
          name={checkBoxIcon}
          size={styles.base.width * 0.8}
          color={customVariables.colorWhite}
        />
      )}
    </View>
  );
};
