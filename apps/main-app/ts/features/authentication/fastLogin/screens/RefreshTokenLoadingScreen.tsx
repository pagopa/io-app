import { useIOColors } from "@io-app/design-system";
import I18n from "i18next";
import { Modal } from "react-native";

import { LoadingScreenContent } from "../../../../components/screens/LoadingScreenContent";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";

const RefreshTokenLoadingScreen = () => {
  useAvoidHardwareBackButton();
  const colors = useIOColors();

  return (
    <Modal backdropColor={colors.background.default}>
      <LoadingScreenContent title={I18n.t("fastLogin.loadingScreen.title")} />
    </Modal>
  );
};
export default RefreshTokenLoadingScreen;
