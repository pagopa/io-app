import { Text as NBText } from "native-base";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { HSpacer } from "../../../../../../components/core/spacer/Spacer";
import IconFont from "../../../../../../components/ui/IconFont";
import themeVariables from "../../../../../../theme/variables";
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
    backgroundColor: themeVariables.colorHighlight
  }
});

const iconSize = 24;
/**
 * This component display a colored box with an icon e some text that warn the user about some discrepancies.
 * @param props
 * @constructor
 */
export const ActivateBonusDiscrepancies: React.FunctionComponent<Props> =
  props => (
    <View
      style={[
        styles.verticalPadding,
        styles.discrepanciesBox,
        bonusVacanzeStyle.row,
        bonusVacanzeStyle.horizontalPadding
      ]}
    >
      <IconFont name={"io-notice"} size={iconSize} />
      <HSpacer size={16} />
      <NBText style={activateBonusStyle.boxText} dark={true}>
        <NBText bold={true} style={activateBonusStyle.boxText} dark={true}>
          {`${props.attention} `}
        </NBText>
        {props.text}
      </NBText>
    </View>
  );
