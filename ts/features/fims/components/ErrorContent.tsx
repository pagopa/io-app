import * as React from "react";
import { Body, Container, Content, Right, View } from "native-base";
import { StyleSheet } from "react-native";
import AppHeader from "../../../components/ui/AppHeader";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import IconFont from "../../../components/ui/IconFont";
import customVariables from "../../../theme/variables";
import { Label } from "../../../components/core/typography/Label";
import { IOStyles } from "../../../components/core/variables/IOStyles";

const styles = StyleSheet.create({
  itemsCenter: { alignItems: "center" },
  selfCenter: { alignSelf: "center" }
});

type Props = {
  text: string;
  close: () => void;
};

const ErrorContent = ({ text, close }: Props) => (
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
        name={"io-error"}
        size={120}
        color={customVariables.brandDanger}
        style={styles.selfCenter}
      />
      <View spacer={true} />

      <View style={styles.itemsCenter}>
        <Label weight={"Bold"}>{text}</Label>
      </View>
    </Content>
  </Container>
);

export default ErrorContent;
