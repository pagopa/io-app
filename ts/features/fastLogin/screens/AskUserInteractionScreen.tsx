import { Modal } from "react-native";
import { IOPictograms } from "@pagopa/io-app-design-system";
import { useAvoidHardwareBackButton } from "../../../utils/useAvoidHardwareBackButton";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";

type PrimaryActionType = Parameters<
  typeof OperationResultScreenContent
>[0]["action"];

type SecondaryActionType = Parameters<
  typeof OperationResultScreenContent
>[0]["secondaryAction"];

export type Props = {
  title: string;
  subtitle: string;
  pictogramName: IOPictograms;
  primaryAction?: PrimaryActionType;
  secondaryAction?: SecondaryActionType;
};

const AskUserInteractionScreen = (props: Props) => {
  useAvoidHardwareBackButton();

  return (
    <Modal>
      <OperationResultScreenContent
        pictogram={props.pictogramName}
        title={props.title}
        subtitle={props.subtitle}
        action={props.primaryAction}
        secondaryAction={props.secondaryAction}
      />
    </Modal>
  );
};
export default AskUserInteractionScreen;
