import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import IconFont from "../../../../../../components/ui/IconFont";
import themeVariables from "../../../../../../theme/variables";
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
  },
  discrepancies: {
    color: themeVariables.colorWhite
  }
});
const iconSize = 24;

/**
 * This component display a colored box with an icon e some text that warn the user about some discrepancies.
 * @param props
 * @constructor
 */
export const ActivateBonusDiscrepancies: React.FunctionComponent<
  Props
> = props => {
  return (
    <View
      style={[
        activateBonusStyle.horizontalPadding,
        styles.verticalPadding,
        styles.discrepanciesBox,
        activateBonusStyle.row
      ]}
    >
      <IconFont
        name={"io-notice"}
        size={iconSize}
        color={themeVariables.colorWhite}
      />
      <View hspacer={true} />
      <Text style={[styles.discrepancies, activateBonusStyle.boxText]}>
        <Text
          bold={true}
          style={[styles.discrepancies, activateBonusStyle.boxText]}
        >
          {`${props.attention} `}
        </Text>
        {props.text}
      </Text>
    </View>
  );
};
