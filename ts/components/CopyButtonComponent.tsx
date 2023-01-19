import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { Text as NBButtonText } from "native-base";
import * as React from "react";
import { Platform, StyleSheet } from "react-native";
import I18n from "../i18n";
import { makeFontStyleObject } from "../theme/fonts";
import customVariables from "../theme/variables";
import { clipboardSetStringWithFeedback } from "../utils/clipboard";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";
import { IOColors } from "./core/variables/IOColors";

type Props = Readonly<{
  textToCopy: string;
  onPressWithGestureHandler?: true;
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
    fontSize: 14,
    lineHeight: 18,
    ...makeFontStyleObject(Platform.select, customVariables.textNormalWeight),
    paddingLeft: 0,
    paddingRight: 0
  },
  colorBlue: {
    color: IOColors.blue
  },
  colorWhite: {
    color: IOColors.white
  }
});

const FEEDBACK_MS = 4000 as Millisecond;

const CopyButtonComponent: React.FunctionComponent<Props> = (props: Props) => {
  const [isTap, setIsTap] = React.useState(false);
  const timerRetry = React.useRef<number | undefined>(undefined);

  React.useEffect(
    () => () => {
      clearTimeout(timerRetry.current);
    },
    []
  );

  const handlePress = () => {
    setIsTap(true);
    clipboardSetStringWithFeedback(props.textToCopy);
    // eslint-disable-next-line functional/immutable-data
    timerRetry.current = setTimeout(() => setIsTap(false), FEEDBACK_MS);
  };

  return (
    <ButtonDefaultOpacity
      onPress={handlePress}
      style={styles.button}
      bordered={!isTap}
      primary={isTap}
      onPressWithGestureHandler={props.onPressWithGestureHandler}
    >
      <NBButtonText
        style={[styles.text, isTap ? styles.colorWhite : styles.colorBlue]}
      >
        {isTap
          ? I18n.t("clipboard.copyFeedbackButton")
          : I18n.t("clipboard.copyText")}
      </NBButtonText>
    </ButtonDefaultOpacity>
  );
};

export default CopyButtonComponent;
