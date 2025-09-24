import { useEffect } from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { SendAARLoadingComponent } from "../components/SendAARLoadingComponent";
import { SendAARTosComponent } from "../components/SendAARTosComponent";
import { setAarFlowState } from "../store/actions";
import { currentAARFlowStateType } from "../store/reducers";
import { sendAARFlowStates } from "../utils/stateUtils";

type SendAarInitialFlowScreenT = {
  qrCode: string;
};
export const SendAARInitialFlowScreen = ({
  qrCode
}: SendAarInitialFlowScreenT) => {
  const flowState = useIOSelector(currentAARFlowStateType);
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, [navigation]);

  useOnFirstRender(() => {
    if (flowState === sendAARFlowStates.none) {
      dispatch(
        setAarFlowState({
          type: sendAARFlowStates.displayingAARToS,
          qrCode
        })
      );
    }
  });
  switch (flowState) {
    case sendAARFlowStates.displayingAARToS:
      return <SendAARTosComponent />;
    default:
      return <SendAARLoadingComponent />;
  }
};
