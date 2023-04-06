import * as React from "react";
import { View } from "react-native";
import { HSpacer } from "../../../../../../components/core/spacer/Spacer";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { Body } from "../../../../../../components/core/typography/Body";
import { Icon } from "../../../../../../components/core/icons/Icon";

type Props = {
  text: string;
};

/**
 * This component display a box with an icon and some text that remind the user some details about the bonus.
 * @param props
 * @constructor
 */
export const ActivateBonusReminder: React.FunctionComponent<Props> = props => (
  <View style={IOStyles.row}>
    <Icon name="profileAlt" size={24} color="bluegrey" />
    <HSpacer size={16} />
    <View style={IOStyles.flex}>
      <Body color="bluegrey">{props.text}</Body>
    </View>
  </View>
);
