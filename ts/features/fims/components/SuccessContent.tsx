import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Label } from "../../../components/core/typography/Label";
import I18n from "../../../i18n";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { Icon } from "../../../components/core/icons/Icon";
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
    <View style={styles.selfCenter}>
      <Icon name="ok" size={96} color="aqua" />
    </View>
    <VSpacer size={24} />

    <View style={styles.itemsCenter}>
      <Label>{`${I18n.t("global.genericThanks")},`}</Label>
      <Label weight={"Bold"}>{text}</Label>
    </View>
  </CommonContent>
);

export default SuccessContent;
