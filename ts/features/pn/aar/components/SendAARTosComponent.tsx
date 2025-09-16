import { IOButton } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { View } from "react-native";
import { useIODispatch } from "../../../../store/hooks";
import { setAarFlowState } from "../store/actions";
import { sendAARFlowStates } from "../store/reducers";

export type SendAARTosComponentProps = {
  qrCode: string;
};

export const SendAARTosComponent = ({ qrCode }: SendAARTosComponentProps) => {
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
      <IOButton
        label={I18n.t("onboarding.tos.accept")}
        testID="primary-button"
        onPress={onButtonPress}
      />
    </View>
  );
};
