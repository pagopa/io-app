import { useIOColors } from "@io-app/design-system";
import { Modal } from "react-native";

import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";

const AskUserInteractionScreen = (props: OperationResultScreenContentProps) => {
  useAvoidHardwareBackButton();

  const colors = useIOColors();

  return (
    <Modal backdropColor={colors.background.default}>
      <OperationResultScreenContent {...props} />
    </Modal>
  );
};
export default AskUserInteractionScreen;
