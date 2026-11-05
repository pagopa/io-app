import { IOColorsLegacy, useIOTheme } from "@io-app/design-system";
import { Modal } from "react-native";

import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";

const AskUserInteractionScreen = (props: OperationResultScreenContentProps) => {
  useAvoidHardwareBackButton();

  const theme = useIOTheme();

  return (
    <Modal backdropColor={IOColorsLegacy[theme["appBackground-primary"]]}>
      <OperationResultScreenContent {...props} />
    </Modal>
  );
};
export default AskUserInteractionScreen;
