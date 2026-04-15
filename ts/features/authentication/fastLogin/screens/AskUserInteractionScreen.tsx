import { Modal } from "react-native";
import { IOColors, useIOTheme } from "@pagopa/io-app-design-system";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";

const AskUserInteractionScreen = (props: OperationResultScreenContentProps) => {
  useAvoidHardwareBackButton();

  const theme = useIOTheme();

  return (
    <Modal backdropColor={IOColors[theme["appBackground-primary"]]}>
      <OperationResultScreenContent {...props} />
    </Modal>
  );
};
export default AskUserInteractionScreen;
