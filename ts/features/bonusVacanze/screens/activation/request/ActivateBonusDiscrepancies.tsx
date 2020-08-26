import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import IconFont from "../../../../../components/ui/IconFont";
import themeVariables from "../../../../../theme/variables";
import { bonusVacanzeStyle } from "../../../components/Styles";
import { activateBonusStyle } from "./Style";

type Props = {
  text: string;
  attention: string;
};

const styles = StyleSheet.create({
  verticalPadding: {
    paddingTop: themeVariables.spacerHeight,
    paddingBottom: themeVariables.spacerHeight
  },
  discrepanciesBox: {
    backgroundColor: themeVariables.brandHighlight
  }
});

const iconSize = 24;
/**
 * This component display a colored box with an icon e some text that warn the user about some discrepancies.
 * @param props
 * @constructor
 */
export const ActivateBonusDiscrepancies: React.FunctionComponent<Props> = props => {
  return (
    <View
      style={[
        styles.verticalPadding,
        styles.discrepanciesBox,
        bonusVacanzeStyle.row,
        bonusVacanzeStyle.horizontalPadding
      ]}
    >
      <IconFont name={"io-notice"} size={iconSize} />
      <View hspacer={true} />
      <Text style={activateBonusStyle.boxText} dark={true}>
        <Text bold={true} style={activateBonusStyle.boxText} dark={true}>
          {`${props.attention} `}
        </Text>
        {props.text}
      </Text>
    </View>
  );
};
