import { Modal } from "react-native";
import I18n from "../../../i18n";
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

  const title = I18n.t("unsupportedDevice.title");
  const subtitle = I18n.t("unsupportedDevice.subtitle");
  const label = I18n.t("unsupportedDevice.cta.faq");

  return (
    <Modal>
      <OperationResultScreenContent
        pictogram="umbrellaNew"
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
