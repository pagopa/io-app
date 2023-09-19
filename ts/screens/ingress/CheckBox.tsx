import * as React from "react";
import { StyleSheet, View } from "react-native";
import {
  IOColors,
  IOIconSizeScaleCheckbox,
  Icon,
  hexToRgba
} from "@pagopa/io-app-design-system";

type Props = {
  checked: boolean;
};

const checkBoxColor = hexToRgba(IOColors.white, 0.15);
const CHECKBOX_SIZE: number = 20;
const CHECKBOX_ICON_SIZE: IOIconSizeScaleCheckbox = 14;

const styles = StyleSheet.create({
  base: {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
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
      <Icon name="checkTickBig" size={CHECKBOX_ICON_SIZE} color="white" />
    )}
  </View>
);
