import { Modal } from "react-native";
import I18n from "../../../../i18n";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";

const RefreshTokenLoadingScreen = () => {
  useAvoidHardwareBackButton();

  const contentTitle = I18n.t("fastLogin.loadingScreen.title");

  return (
    <Modal>
      <LoadingScreenContent contentTitle={contentTitle} />
    </Modal>
  );
};
export default RefreshTokenLoadingScreen;
