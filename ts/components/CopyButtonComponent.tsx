import I18n from "i18n-js";
import { Text } from "native-base";
import * as React from "react";
import { LayoutChangeEvent, Platform, StyleSheet } from "react-native";
import { Millisecond } from "italia-ts-commons/lib/units";
import { makeFontStyleObject } from "../theme/fonts";
import customVariables from "../theme/variables";
import {
  clipboardSetStringWithFeedback,
  clipboardSetStringWithoutFeedback
} from "../utils/clipboard";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";

type Feedback = "toast" | "inPlace";
type Props = Readonly<{
  textToCopy: string;
  feedback?: Feedback;
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
const restoreTextTimeout = 2000 as Millisecond;
const getCopyText = () => I18n.t("clipboard.copyText");
export default function CopyButtonComponent(props: Props) {
  const [copyText, setCopyText] = React.useState(getCopyText());
  const [buttonWidth, setButtonWidth] = React.useState<number | undefined>(
    undefined
  );
  // if feedback is not defined, toast is default
  const feedback = props.feedback ?? "toast";

  const handleCopy = () => {
    switch (feedback) {
      case "inPlace":
        setCopyText("✓");
        setTimeout(() => setCopyText(getCopyText()), restoreTextTimeout);
        clipboardSetStringWithoutFeedback(props.textToCopy);
        break;
      case "toast":
        clipboardSetStringWithFeedback(props.textToCopy);
    }
  };

  // when the button is render, store the width. This is because
  // if we change the button text we don't want it resized its width
  const handleButtonLayoutChange = (le: LayoutChangeEvent) => {
    if (buttonWidth === undefined) {
      setButtonWidth(le.nativeEvent.layout.width);
    }
  };

  return (
    <ButtonDefaultOpacity
      onLayout={handleButtonLayoutChange}
      onPress={handleCopy}
      style={[styles.button, { width: buttonWidth }]}
      bordered={true}
    >
      <Text style={styles.text} small={true}>
        {copyText}
      </Text>
    </ButtonDefaultOpacity>
  );
}
