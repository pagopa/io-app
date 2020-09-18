import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import IconFont from "../../../../../../components/ui/IconFont";
import themeVariables from "../../../../../../theme/variables";
import { bonusVacanzeStyle } from "../../../components/Styles";
import { activateBonusStyle } from "./Style";

type Props = {
  text: string;
};

const styles = StyleSheet.create({
  reminder: {
    color: themeVariables.lightGray
  },
  link: {
    color: themeVariables.textLinkColor
  }
});

/**
 * This component display a box with an icon and some text that remind the user some details about the bonus.
 * @param props
 * @constructor
 */
export const ActivateBonusReminder: React.FunctionComponent<Props> = props => (
  <View style={[bonusVacanzeStyle.row]}>
    <IconFont name={"io-titolare"} size={24} color={themeVariables.lightGray} />
    <View hspacer={true} />
    <Text style={[activateBonusStyle.boxText, styles.reminder]}>
      {props.text}
    </Text>
  </View>
);
