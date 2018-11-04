import { Text } from "native-base";
import * as React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
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
}

export const AddPaymentMethodButton: React.SFC<Props> = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.button}>
    <IconFont name="io-plus" color={customVariables.colorWhite} />
    <Text style={styles.label}>
      {I18n.t("wallet.newPaymentMethod.add").toUpperCase()}
    </Text>
  </TouchableOpacity>
);
