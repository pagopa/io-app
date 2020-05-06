import I18n from "i18n-js";
import { Text } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import customVariables from "../theme/variables";
import { clipboardSetStringWithFeedback } from "../utils/clipboard";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";

type Props = Readonly<{
  textToCopy: string;
}>;

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 8,
    backgroundColor: customVariables.colorWhite,
    borderColor: customVariables.brandPrimary,
    borderWidth: 1,
    paddingBottom: 0,
    paddingTop: 0,
    height: 28,
    alignSelf: "center"
  },
  text: {
    color: customVariables.brandPrimary,
    paddingLeft: 0,
    paddingRight: 0,
    marginBottom: 4
  }
});

export default function CopyButtonComponent(props: Props) {
  return (
    <ButtonDefaultOpacity
      onPress={() => clipboardSetStringWithFeedback(props.textToCopy)}
      style={styles.button}
    >
      <Text style={styles.text}>{I18n.t("clipboard.copyText")}</Text>
    </ButtonDefaultOpacity>
  );
}
