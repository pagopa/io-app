import { Text as NBText } from "native-base";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import IconFont from "../../../../../../components/ui/IconFont";
import { bonusVacanzeStyle } from "../../../components/Styles";
import { IOColors } from "../../../../../../components/core/variables/IOColors";
import { HSpacer } from "../../../../../../components/core/spacer/Spacer";
import { activateBonusStyle } from "./Style";

type Props = {
  text: string;
};

const styles = StyleSheet.create({
  reminder: {
    color: IOColors.grey
  }
});

/**
 * This component display a box with an icon and some text that remind the user some details about the bonus.
 * @param props
 * @constructor
 */
export const ActivateBonusReminder: React.FunctionComponent<Props> = props => (
  <View style={bonusVacanzeStyle.row}>
    <IconFont name={"io-titolare"} size={24} color={IOColors.grey} />
    <HSpacer size={16} />
    <NBText style={[activateBonusStyle.boxText, styles.reminder]}>
      {props.text}
    </NBText>
  </View>
);
