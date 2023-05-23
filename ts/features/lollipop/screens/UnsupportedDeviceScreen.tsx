import I18n from "i18n-js";
import { Text as NBButtonText } from "native-base";
import * as React from "react";
import { View, SafeAreaView, StyleSheet, Modal } from "react-native";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import Pictogram from "../../../components/core/pictograms/Pictogram";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { Body } from "../../../components/core/typography/Body";
import { H3 } from "../../../components/core/typography/H3";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { unsupportedDeviceLearnMoreUrl } from "../../../config";
import themeVariables from "../../../theme/variables";
import { openWebUrl } from "../../../utils/url";
import { useAvoidHardwareBackButton } from "../../../utils/useAvoidHardwareBackButton";

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 56
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: themeVariables.contentPadding
  },
  title: {
    textAlign: "center"
  }
});

const handleLearnMorePress = () => {
  openWebUrl(unsupportedDeviceLearnMoreUrl);
};

// This component doesn't need a BaseHeaderComponent.
// It Represents a blocking error screen that you can only escape with the rendered button(s).
// A new template is coming soon: https://pagopa.atlassian.net/browse/IOAPPFD0-71
const UnsupportedDeviceScreen = () => {
  useAvoidHardwareBackButton();
  return (
    <Modal>
      <SafeAreaView style={IOStyles.flex}>
        <View style={styles.errorContainer}>
          <Pictogram name={"error"} size={120} />
          <VSpacer size={16} />
          <H3 style={styles.title}>{I18n.t("unsupportedDevice.title")}</H3>
          <VSpacer size={16} />
          <Body style={{ textAlign: "center" }}>
            {I18n.t("unsupportedDevice.subtitle")}
          </Body>
        </View>
        <View style={styles.buttonContainer}>
          <ButtonDefaultOpacity block={true} onPress={handleLearnMorePress}>
            <NBButtonText>{I18n.t("unsupportedDevice.cta.faq")}</NBButtonText>
          </ButtonDefaultOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
export default UnsupportedDeviceScreen;
