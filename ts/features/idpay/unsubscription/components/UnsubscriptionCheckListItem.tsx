import { ListItem as NBListItem } from "native-base";
import React from "react";
import { View } from "react-native";
import { CheckBox } from "../../../../components/core/selection/checkbox/CheckBox";
import { HSpacer, VSpacer } from "../../../../components/core/spacer/Spacer";
import { H4 } from "../../../../components/core/typography/H4";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../components/core/variables/IOStyles";

type Props = {
  title: string;
  subtitle: string;
  checked: boolean;
  onValueChange?: (newValue: boolean) => void;
};

const UnsubscriptionCheckListItem = (props: Props) => (
  <NBListItem>
    <View style={IOStyles.row}>
      <View style={IOStyles.flex}>
        <H4>{props.title}</H4>
        <VSpacer size={4} />
        <LabelSmall color="bluegrey" weight="Regular">
          {props.subtitle}
        </LabelSmall>
      </View>
      <HSpacer size={24} />
      <CheckBox {...props} />
    </View>
  </NBListItem>
);

export { UnsubscriptionCheckListItem };
