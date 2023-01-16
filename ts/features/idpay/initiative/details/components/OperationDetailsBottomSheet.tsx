import { Text as NBText } from "native-base";
import React from "react";
import { View } from "react-native";
import { OperationListDTO } from "../../../../../../definitions/idpay/timeline/OperationListDTO";
import ButtonDefaultOpacity from "../../../../../components/ButtonDefaultOpacity";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";

type Props = {
  operation?: OperationListDTO;
  onDismiss: () => void;
};

const OperationDetailsBottomSheet = (props: Props) => {
  const { operation, onDismiss } = props;

  return (
    <View style={IOStyles.flex}>
      <NBText>{operation?.operationId}</NBText>
      <ButtonDefaultOpacity block={true} bordered={true} onPress={onDismiss}>
        <NBText>{I18n.t("global.buttons.close")}</NBText>
      </ButtonDefaultOpacity>
    </View>
  );
};

export const useOperationDetailsBottomSheet = () => {
  const [operation, setOperation] = React.useState<
    OperationListDTO | undefined
  >(undefined);

  const modal = useIOBottomSheetModal(
    <OperationDetailsBottomSheet
      operation={operation}
      onDismiss={() => modal.dismiss()}
    />,
    "Dettaglio dell'operazione",
    200
  );

  const present = (operation: OperationListDTO) => {
    setOperation(operation);
    modal.present();
  };

  return { bottomSheet: modal.bottomSheet, present, dismiss: modal.dismiss };
};
