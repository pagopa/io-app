import * as React from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  Modal,
  GestureResponderEvent
} from "react-native";
import I18n from "../../../i18n";
import {
  IOPictograms,
  Pictogram
} from "../../../components/core/pictograms/Pictogram";
import { HSpacer, VSpacer } from "../../../components/core/spacer/Spacer";
import { Body } from "../../../components/core/typography/Body";
import { H3 } from "../../../components/core/typography/H3";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import themeVariables from "../../../theme/variables";
import { useAvoidHardwareBackButton } from "../../../utils/useAvoidHardwareBackButton";
import ButtonOutline from "../../../components/ui/ButtonOutline";
import ButtonSolid from "../../../components/ui/ButtonSolid";
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

type ButtonStyle = "solid" | "outline";
type ButtonStylesProps = {
  submitButtonStyle: ButtonStyle;
  exitButtonStyle?: ButtonStyle;
};
const DefaultButtonStylesProps: ButtonStylesProps = {
  submitButtonStyle: "solid",
  exitButtonStyle: "outline"
};

const DEFAULT_TIMER_DURATION = 60;

type Props = {
  title: string;
  subtitle: string;
  pictogramName: IOPictograms;
  onSubmit: () => void;
  onExit?: () => void;
  onTimerExpired?: () => void;
  timerDuration?: number;
  ButtonStylesProps?: ButtonStylesProps;
};

// This component doesn't need a BaseHeaderComponent.
// It Represents a blocking error screen that you can only escape with the rendered button(s).
// A new template is coming soon: https://pagopa.atlassian.net/browse/IOAPPFD0-71
const AskUserToContinueScreen = (props: Props) => {
  useAvoidHardwareBackButton();

  const { submitButtonStyle, exitButtonStyle } =
    props.ButtonStylesProps || DefaultButtonStylesProps;

  const exitButtonProps = {
    fullWidth: true,
    onPress: (_: GestureResponderEvent) => props.onExit && props.onExit(),
    label: I18n.t("global.buttons.exit"),
    accessibilityLabel: I18n.t("global.buttons.exit")
  };

  const submitButtonProps = {
    fullWidth: true,
    onPress: (_: GestureResponderEvent) => props.onSubmit(),
    label: I18n.t("global.buttons.continue"),
    accessibilityLabel: I18n.t("global.buttons.continue")
  };

  return (
    <Modal>
      <SafeAreaView style={IOStyles.flex}>
        {props.onExit && <ModalHeader onClose={props.onExit} />}
        <View style={styles.mainContainer}>
          <Pictogram name={props.pictogramName} size={120} />
          <VSpacer size={16} />
          <H3 style={styles.title}>{props.title}</H3>
          <VSpacer size={16} />
          <Body style={{ textAlign: "center" }}>{props.subtitle}</Body>
          <VSpacer size={16} />
          {props.onTimerExpired && (
            <CountDown
              totalSeconds={props.timerDuration ?? DEFAULT_TIMER_DURATION}
              onExpiration={props.onTimerExpired}
            />
          )}
        </View>
        <View style={styles.buttonContainer}>
          {props.onExit && (
            <>
              <View style={IOStyles.flex}>
                {exitButtonStyle === "outline" ? (
                  <ButtonOutline {...exitButtonProps} />
                ) : (
                  <ButtonSolid {...exitButtonProps} />
                )}
              </View>
              <HSpacer size={16} />
            </>
          )}
          <View style={IOStyles.flex}>
            {submitButtonStyle === "solid" ? (
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
export default AskUserToContinueScreen;
