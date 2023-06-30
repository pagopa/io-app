import * as React from "react";
import { Modal } from "react-native";
import { useAvoidHardwareBackButton } from "../../../utils/useAvoidHardwareBackButton";
import LoadingSpinnerOverlay from "../../../components/LoadingSpinnerOverlay";

const RefreshTokenLoadingScreen = () => {
  useAvoidHardwareBackButton();

  return (
    <Modal>
      <LoadingSpinnerOverlay isLoading={true} loadingOpacity={1} />
    </Modal>
  );
};
export default RefreshTokenLoadingScreen;
