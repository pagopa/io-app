import I18n from "i18n-js";
import * as React from "react";
import { View, SafeAreaView, StyleSheet, Modal } from "react-native";
import { useDispatch } from "react-redux";
import { Pictogram } from "../../../components/core/pictograms/Pictogram";
import { HSpacer, VSpacer } from "../../../components/core/spacer/Spacer";
import { Body } from "../../../components/core/typography/Body";
import { H3 } from "../../../components/core/typography/H3";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import themeVariables from "../../../theme/variables";
import { useAvoidHardwareBackButton } from "../../../utils/useAvoidHardwareBackButton";
import ButtonOutline from "../../../components/ui/ButtonOutline";
import ButtonSolid from "../../../components/ui/ButtonSolid";
import { askUserToRefreshSessionToken } from "../../../store/actions/authentication";
import CountDown from "../components/CountDown";

const styles = StyleSheet.create({
  errorContainer: {
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

// This component doesn't need a BaseHeaderComponent.
// It Represents a blocking error screen that you can only escape with the rendered button(s).
// A new template is coming soon: https://pagopa.atlassian.net/browse/IOAPPFD0-71
const AskUserToContinueScreen = () => {
  useAvoidHardwareBackButton();
  const dispatch = useDispatch();

  return (
    <Modal>
      <SafeAreaView style={IOStyles.flex}>
        <View style={styles.errorContainer}>
          <Pictogram name={"attention"} size={120} />
          <VSpacer size={16} />
          <H3 style={styles.title}>
            {I18n.t("fastLogin.userInteraction.continueNavigation.title")}
          </H3>
          <VSpacer size={16} />
          <Body style={{ textAlign: "center" }}>
            {I18n.t("fastLogin.userInteraction.continueNavigation.subtitle")}
          </Body>
          <VSpacer size={16} />
          <CountDown
            totalSeconds={120}
            actionToDispatchWhenExpired={askUserToRefreshSessionToken.success(
              "no"
            )}
          />
        </View>
        <View style={styles.buttonContainer}>
          <View style={IOStyles.flex}>
            <ButtonOutline
              fullWidth
              onPress={() => {
                dispatch(askUserToRefreshSessionToken.success("no"));
              }}
              label={I18n.t("global.buttons.exit")}
              accessibilityLabel={I18n.t("global.buttons.exit")}
            />
          </View>
          <HSpacer size={16} />
          <View style={IOStyles.flex}>
            <ButtonSolid
              fullWidth
              onPress={() => {
                dispatch(askUserToRefreshSessionToken.success("yes"));
              }}
              label={I18n.t("global.buttons.continue")}
              accessibilityLabel={I18n.t("global.buttons.continue")}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
export default AskUserToContinueScreen;
