import I18n from "i18n-js";
import * as React from "react";
import { StyleSheet } from "react-native";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { Label } from "../../../components/core/typography/Label";
import { IOColors } from "../../../components/core/variables/IOColors";
import customVariables from "../../../theme/variables";

type Props = {
  onPress?: () => void;
};

const styles = StyleSheet.create({
  cancelButton: {
    borderColor: IOColors.red,
    width: '100%',
    height: customVariables.btnHeight + 2,
  }
});

/**
 * The base component that represents a unsubscribe button
 * @param props
 * @constructor
 */

const UnsubscribeButton: React.FunctionComponent<Props> = (props: Props) => (
  <ButtonDefaultOpacity bordered={true} style={styles.cancelButton} onPress={props.onPress}>
    <Label color={"red"}>{I18n.t("wallet.bancomat.details.removeCta")}</Label>
  </ButtonDefaultOpacity>
);

export default UnsubscribeButton;
