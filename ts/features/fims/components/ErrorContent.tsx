import * as React from "react";
import { View, StyleSheet } from "react-native";
import IconFont from "../../../components/ui/IconFont";
import customVariables from "../../../theme/variables";
import { Label } from "../../../components/core/typography/Label";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import CommonContent from "./CommonContent";

const styles = StyleSheet.create({
  itemsCenter: { alignItems: "center" },
  selfCenter: { alignSelf: "center" }
});

type Props = {
  text: string;
  close: () => void;
};

const ErrorContent = ({ text, close }: Props) => (
  <CommonContent close={close}>
    <IconFont
      name={"io-error"}
      size={120}
      color={customVariables.brandDanger}
      style={styles.selfCenter}
    />
    <VSpacer size={16} />

    <View style={styles.itemsCenter}>
      <Label weight={"Bold"}>{text}</Label>
    </View>
  </CommonContent>
);

export default ErrorContent;
