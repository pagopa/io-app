import * as React from "react";
import { View, StyleSheet } from "react-native";
import { HSpacer } from "../../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../../components/core/typography/Body";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import themeVariables from "../../../../../../theme/variables";
import { Icon } from "../../../../../../components/core/icons/Icon";

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
        IOStyles.row,
        IOStyles.horizontalContentPadding
      ]}
    >
      <Icon name="notice" size={iconSize} />
      <HSpacer size={16} />
      <View style={IOStyles.flex}>
        <Body>
          <Body weight="SemiBold" color="bluegreyDark">
            {`${props.attention} `}
          </Body>
          {props.text}
        </Body>
      </View>
    </View>
  );
