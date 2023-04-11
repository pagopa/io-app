import * as React from "react";
import { View } from "react-native";
import IconFont from "../../../../../../components/ui/IconFont";
import { IOColors } from "../../../../../../components/core/variables/IOColors";
import { HSpacer } from "../../../../../../components/core/spacer/Spacer";
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
    <IconFont name={"io-titolare"} size={24} color={IOColors.bluegrey} />
    <HSpacer size={16} />
    <View style={IOStyles.flex}>
      <Body color="bluegrey">{props.text}</Body>
    </View>
  </View>
);
