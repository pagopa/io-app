import * as React from "react";
import { StyleSheet, View } from "react-native";
import IconFont from "../../components/ui/IconFont";
import { IOColors } from "../../components/core/variables/IOColors";

type Props = {
  checked: boolean;
};

const checkBoxColor = IOColors.blue;
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
          color={IOColors.white}
        />
      )}
    </View>
  );
};
