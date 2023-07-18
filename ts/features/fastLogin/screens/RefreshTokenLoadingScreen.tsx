import * as React from "react";
import { Modal } from "react-native";
import { useAvoidHardwareBackButton } from "../../../utils/useAvoidHardwareBackButton";
import LoadingSpinnerOverlay from "../../../components/LoadingSpinnerOverlay";
import { isDevEnv } from "../../../utils/environment";
import { Body } from "../../../components/core/typography/Body";

const RefreshTokenLoadingScreen = () => {
  useAvoidHardwareBackButton();

  return (
    <Modal>
      <LoadingSpinnerOverlay isLoading={true} loadingOpacity={1} />
      {isDevEnv ? <Body>RefreshTokenLoadingScreen</Body> : null}
    </Modal>
  );
};
export default RefreshTokenLoadingScreen;
