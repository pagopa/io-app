import * as React from "react";
import { View } from "native-base";
import { StyleSheet } from "react-native";
import IconFont from "../../../components/ui/IconFont";
import customVariables from "../../../theme/variables";
import { Label } from "../../../components/core/typography/Label";
import I18n from "../../../i18n";
import CommonContent from "./CommonContent";

const styles = StyleSheet.create({
  itemsCenter: { alignItems: "center" },
  selfCenter: { alignSelf: "center" }
});

type Props = {
  text: string;
  close: () => void;
};
const SuccessContent = ({ text, close }: Props) => (
  <CommonContent close={close}>
    <IconFont
      name={"io-complete"}
      size={120}
      color={customVariables.brandHighlight}
      style={styles.selfCenter}
    />
    <View spacer={true} large={true} />

    <View style={styles.itemsCenter}>
      <Label>{`${I18n.t("global.genericThanks")},`}</Label>
      <Label weight={"Bold"}>{text}</Label>
    </View>
  </CommonContent>
);

export default SuccessContent;
