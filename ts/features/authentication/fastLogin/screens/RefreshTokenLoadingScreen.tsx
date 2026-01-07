import { IOColors, useIOTheme } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { Modal } from "react-native";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";

const RefreshTokenLoadingScreen = () => {
  useAvoidHardwareBackButton();
  const theme = useIOTheme();

  return (
    <Modal backdropColor={IOColors[theme["appBackground-primary"]]}>
      <LoadingScreenContent title={I18n.t("fastLogin.loadingScreen.title")} />
    </Modal>
  );
};
export default RefreshTokenLoadingScreen;
