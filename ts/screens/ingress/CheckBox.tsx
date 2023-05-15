import * as React from "react";
import { StyleSheet, View } from "react-native";
import { IOColors, hexToRgba } from "../../components/core/variables/IOColors";
import { Icon } from "../../components/core/icons";

type Props = {
  checked: boolean;
};

const checkBoxColor = hexToRgba(IOColors.white, 0.15);

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
  <View style={[styles.base, props.checked ? styles.checked : {}]}>
    {props.checked && (
      <Icon name="legCompleted" size={styles.base.width} color="white" />
    )}
  </View>
);
