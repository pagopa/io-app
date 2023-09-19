import * as React from "react";
import { View } from "react-native";
import { HSpacer, Icon } from "@pagopa/io-app-design-system";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { Body } from "../../../../../../components/core/typography/Body";

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
