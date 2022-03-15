import * as React from "react";
import { Body, Container, Content, Right, View } from "native-base";
import { StyleSheet } from "react-native";
import AppHeader from "../../../components/ui/AppHeader";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import IconFont from "../../../components/ui/IconFont";
import customVariables from "../../../theme/variables";
import { Label } from "../../../components/core/typography/Label";
import I18n from "../../../i18n";
import { IOStyles } from "../../../components/core/variables/IOStyles";

const styles = StyleSheet.create({
  itemsCenter: { alignItems: "center" },
  selfCenter: { alignSelf: "center" }
});

type Props = {
  text: string;
  close: () => void;
};
const SuccessContent = ({ text, close }: Props) => (
  <Container>
    <AppHeader noLeft={true}>
      <Body />
      <Right>
        <ButtonDefaultOpacity onPress={close} transparent={true}>
          <IconFont name={"io-close"} />
        </ButtonDefaultOpacity>
      </Right>
    </AppHeader>
    <Content style={IOStyles.flex}>
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
    </Content>
  </Container>
);

export default SuccessContent;
