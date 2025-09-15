import { IOButton } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { setAarFlowState } from "../store/actions";
import { currentAARFlowData, sendAARFlowStates } from "../store/reducers";

export type SendAARTosScreenProps = {
  qrcode: string;
};

export const SendAARTosScreen = () => {
  const flowData = useIOSelector(currentAARFlowData);
  const flowState = flowData.type;

  switch (flowState) {
    case sendAARFlowStates.none:
    case sendAARFlowStates.fetchingQRData:
      return <LoadingComponent />;
    case sendAARFlowStates.displayingAARToS:
      return <TosComponent qrCode={flowData.qrCode} />;
  }
};

const LoadingComponent = () => <LoadingScreenContent contentTitle="" />;
const TosComponent = ({ qrCode }: { qrCode: string }) => {
  const dispatch = useIODispatch();

  const onButtonPress = () => {
    dispatch(
      setAarFlowState({
        type: sendAARFlowStates.fetchingQRData,
        qrCode
      })
    );
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-end",
        padding: 30
      }}
    >
      <IOButton label="Avanti" onPress={onButtonPress} />
    </View>
  );
};
