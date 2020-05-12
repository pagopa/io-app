import I18n from "i18n-js";
import { Text } from "native-base";
import * as React from "react";
import { Platform, StyleSheet } from "react-native";
import { makeFontStyleObject } from "../theme/fonts";
import customVariables from "../theme/variables";
import { clipboardSetStringWithFeedback } from "../utils/clipboard";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";

type Props = Readonly<{
  textToCopy: string;
}>;

const styles = StyleSheet.create({
  button: {
    paddingLeft: 8,
    paddingRight: 8,
    paddingBottom: 0,
    paddingTop: 0,
    height: 23,
    alignSelf: "center"
  },
  text: {
    ...makeFontStyleObject(Platform.select, customVariables.textNormalWeight),
    color: customVariables.brandPrimary,
    paddingLeft: 0,
    paddingRight: 0
  }
});

export default function CopyButtonComponent(props: Props) {
  return (
    <ButtonDefaultOpacity
      onPress={() => clipboardSetStringWithFeedback(props.textToCopy)}
      style={styles.button}
      bordered={true}
    >
      <Text style={styles.text} small={true}>
        {I18n.t("clipboard.copyText")}
      </Text>
    </ButtonDefaultOpacity>
  );
}
