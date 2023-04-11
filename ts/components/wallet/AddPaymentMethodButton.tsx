import { Text as NBButtonText } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import TouchableDefaultOpacity from "../TouchableDefaultOpacity";
import { IOColors } from "../core/variables/IOColors";
import { Icon } from "../core/icons/Icon";

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end"
  },
  label: {
    marginLeft: customVariables.fontSizeBase / 4,
    color: IOColors.white
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
    <Icon name="legAdd" color="white" size={iconSize} />
    <NBButtonText bold={true} style={[styles.label, { fontSize: labelSize }]}>
      {I18n.t("wallet.newPaymentMethod.add").toUpperCase()}
    </NBButtonText>
  </TouchableDefaultOpacity>
);
