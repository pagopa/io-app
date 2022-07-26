import * as React from "react";
import { StyleSheet, View } from "react-native";
import IconFont from "../../components/ui/IconFont";
import { IOColors } from "../../components/core/variables/IOColors";

type Props = {
  checked: boolean;
};

const checkBoxColor = `rgba(255, 255, 255, 0.15)`;
const checkBoxIcon = "io-tick-big";

const styles = StyleSheet.create({
  base: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: checkBoxColor,
    borderRadius: 4
  },
  checked: {
    borderColor: `transparent`,
    backgroundColor: checkBoxColor
  }
});

export const IngressCheckBox = (props: Props) => (
  <View style={[styles.base, props.checked && styles.checked]}>
    {props.checked && (
      <IconFont
        name={checkBoxIcon}
        size={styles.base.width * 0.7}
        color={IOColors.white}
      />
    )}
  </View>
);
