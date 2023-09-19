import * as React from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  Modal,
  GestureResponderEvent
} from "react-native";
import {
  ButtonOutline,
  ButtonSolid,
  HSpacer,
  VSpacer,
  IOPictograms,
  Pictogram
} from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";
import { Body } from "../../../components/core/typography/Body";
import { H3 } from "../../../components/core/typography/H3";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import themeVariables from "../../../theme/variables";
import { useAvoidHardwareBackButton } from "../../../utils/useAvoidHardwareBackButton";
import CountDown from "../components/CountDown";
import ModalHeader from "../components/ModalHeader";

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: themeVariables.contentPaddingLarge
  },
  buttonContainer: {
    flexDirection: "row",
    padding: themeVariables.contentPadding
  },
  title: {
    textAlign: "center"
  }
});

type ButtonStyle = {
  type: "solid" | "outline";
  title: string;
};
type ButtonStylesProps = {
  submitButtonStyle: ButtonStyle;
  cancelButtonStyle?: ButtonStyle;
};
const DefaultButtonStylesProps: ButtonStylesProps = {
  submitButtonStyle: {
    type: "solid",
    title: I18n.t("global.buttons.continue")
  },
  cancelButtonStyle: { type: "outline", title: I18n.t("global.buttons.cancel") }
};

const DEFAULT_TIMER_DURATION = 60;

export type Props = {
  title: string;
  subtitle: string;
  pictogramName: IOPictograms;
  onSubmit: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  onTimerExpired?: () => void;
  timerDurationInSeconds?: number;
  buttonStylesProps?: ButtonStylesProps;
};

const AskUserInteractionScreen = (props: Props) => {
  useAvoidHardwareBackButton();

  const { submitButtonStyle, cancelButtonStyle } =
    props.buttonStylesProps || DefaultButtonStylesProps;

  const cancelButtonTitle =
    cancelButtonStyle?.title || I18n.t("global.buttons.exit");
  const cancelButtonProps = {
    fullWidth: true,
    onPress: (_: GestureResponderEvent) => props.onCancel && props.onCancel(),
    label: cancelButtonTitle,
    accessibilityLabel: cancelButtonTitle
  };

  const submitButtonTitle = submitButtonStyle.title;
  const submitButtonProps = {
    fullWidth: true,
    onPress: (_: GestureResponderEvent) => props.onSubmit(),
    label: submitButtonTitle,
    accessibilityLabel: submitButtonTitle
  };

  return (
    <Modal>
      <SafeAreaView style={IOStyles.flex}>
        {props.onClose && (
          <ModalHeader testID="header" onClose={props.onClose} />
        )}
        <View style={styles.mainContainer}>
          <Pictogram name={props.pictogramName} size={120} />
          <VSpacer size={16} />
          <H3 style={styles.title}>{props.title}</H3>
          <VSpacer size={16} />
          <Body style={{ textAlign: "center" }}>{props.subtitle}</Body>
          <VSpacer size={16} />
          {props.onTimerExpired && (
            <CountDown
              testID={"countdown-timer"}
              totalSeconds={
                props.timerDurationInSeconds ?? DEFAULT_TIMER_DURATION
              }
              onExpiration={props.onTimerExpired}
            />
          )}
        </View>
        <View style={styles.buttonContainer}>
          {props.onCancel && (
            <>
              <View style={IOStyles.flex}>
                {cancelButtonStyle?.type === "outline" ? (
                  <ButtonOutline {...cancelButtonProps} />
                ) : (
                  <ButtonSolid {...cancelButtonProps} />
                )}
              </View>
              <HSpacer size={16} />
            </>
          )}
          <View style={IOStyles.flex}>
            {submitButtonStyle.type === "solid" ? (
              <ButtonSolid {...submitButtonProps} />
            ) : (
              <ButtonOutline {...submitButtonProps} />
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
export default AskUserInteractionScreen;
