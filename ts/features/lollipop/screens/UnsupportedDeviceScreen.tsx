import I18n from "i18n-js";
import * as React from "react";
import { Modal } from "react-native";
import { unsupportedDeviceLearnMoreUrl } from "../../../config";
import { openWebUrl } from "../../../utils/url";
import { useAvoidHardwareBackButton } from "../../../utils/useAvoidHardwareBackButton";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";

const handleLearnMorePress = () => {
  openWebUrl(unsupportedDeviceLearnMoreUrl);
};

// This component Represents a blocking error screen that you can only escape with the rendered button(s).
const UnsupportedDeviceScreen = () => {
  useAvoidHardwareBackButton();

  return (
    <Modal>
      <OperationResultScreenContent
        pictogram="umbrellaNew"
        title={I18n.t("unsupportedDevice.title")}
        subtitle={I18n.t("unsupportedDevice.subtitle")}
        secondaryAction={{
          label: I18n.t("unsupportedDevice.cta.faq"),
          accessibilityLabel: I18n.t("unsupportedDevice.cta.faq"),
          onPress: handleLearnMorePress
        }}
      />
    </Modal>
  );
};
export default UnsupportedDeviceScreen;
