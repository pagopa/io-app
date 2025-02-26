import { Modal } from "react-native";
import I18n from "../../../i18n";
import { openWebUrl } from "../../../utils/url";
import { useAvoidHardwareBackButton } from "../../../utils/useAvoidHardwareBackButton";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useIOSelector } from "../../../store/hooks";
import { generateDynamicUrlSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { UNSUPPORTED_DEVICE_FAQ_URL_BODY } from "../../../urls";

// This component Represents a blocking error screen that you can only escape with the rendered button(s).
const UnsupportedDeviceScreen = () => {
  useAvoidHardwareBackButton();

  const unsupportedDeviceLearnMoreUrl = useIOSelector(state =>
    generateDynamicUrlSelector(
      state,
      "io_showcase",
      UNSUPPORTED_DEVICE_FAQ_URL_BODY
    )
  );

  const handleLearnMorePress = () => {
    openWebUrl(unsupportedDeviceLearnMoreUrl);
  };

  const title = I18n.t("unsupportedDevice.title");
  const subtitle = I18n.t("unsupportedDevice.subtitle");
  const label = I18n.t("unsupportedDevice.cta.faq");

  return (
    <Modal>
      <OperationResultScreenContent
        pictogram="umbrella"
        title={title}
        subtitle={subtitle}
        secondaryAction={{
          label,
          onPress: handleLearnMorePress
        }}
      />
    </Modal>
  );
};
export default UnsupportedDeviceScreen;
