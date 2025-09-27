import { Modal } from "react-native";
import {
  IOColors,
  IOPictograms,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";

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

  const theme = useIOTheme();

  return (
    <Modal backdropColor={IOColors[theme["appBackground-primary"]]}>
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
