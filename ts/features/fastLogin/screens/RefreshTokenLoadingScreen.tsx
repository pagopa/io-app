import * as React from "react";
import { Modal } from "react-native";
import { useAvoidHardwareBackButton } from "../../../utils/useAvoidHardwareBackButton";
import LoadingSpinnerOverlay from "../../../components/LoadingSpinnerOverlay";

// This component doesn't need a BaseHeaderComponent.
// It Represents a blocking error screen that you can only escape with the rendered button(s).
// A new template is coming soon: https://pagopa.atlassian.net/browse/IOAPPFD0-71
const RefreshTokenLoadingScreen = () => {
  useAvoidHardwareBackButton();

  return (
    <Modal>
      <LoadingSpinnerOverlay isLoading={true} loadingOpacity={1} />
    </Modal>
  );
};
export default RefreshTokenLoadingScreen;
