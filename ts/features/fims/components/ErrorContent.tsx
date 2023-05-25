import * as React from "react";
import { View } from "react-native";
import { Label } from "../../../components/core/typography/Label";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { Icon } from "../../../components/core/icons/Icon";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import CommonContent from "./CommonContent";

type Props = {
  text: string;
  close: () => void;
};

const ErrorContent = ({ text, close }: Props) => (
  <CommonContent close={close}>
    <View style={IOStyles.selfCenter}>
      <Icon name="errorFilled" size={96} color="red" />
    </View>
    <VSpacer size={16} />

    <View style={IOStyles.alignCenter}>
      <Label weight={"Bold"}>{text}</Label>
    </View>
  </CommonContent>
);

export default ErrorContent;
