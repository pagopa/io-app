import { Text } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import TouchableDefaultOpacity from "../TouchableDefaultOpacity";
import IconFont from "../ui/IconFont";

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end"
  },
  label: {
    marginLeft: customVariables.fontSizeBase / 4,
    color: customVariables.colorWhite
  }
});

interface Props {
  onPress: () => void;
  iconSize?: number;
  labelSize?: number;
}

export const AddPaymentMethodButton: React.SFC<Props> = ({
  onPress,
  iconSize,
  labelSize
}) => (
  <TouchableDefaultOpacity onPress={onPress} style={styles.button}>
    <IconFont
      name="io-plus"
      color={customVariables.colorWhite}
      size={iconSize}
    />
    <Text style={[styles.label, labelSize ? { fontSize: labelSize } : {}]}>
      {I18n.t("wallet.newPaymentMethod.add").toUpperCase()}
    </Text>
  </TouchableDefaultOpacity>
);
