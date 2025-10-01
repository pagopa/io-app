import { useEffect } from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import PN_ROUTES from "../../navigation/routes";
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

  useEffect(() => {
    if (
      flowState === sendAARFlowStates.notAddresseeFinal ||
      flowState === sendAARFlowStates.ko
    ) {
      navigation.replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
        screen: PN_ROUTES.MAIN,
        params: {
          screen: PN_ROUTES.SEND_AAR_ERROR
        }
      });
    }
  }, [flowState, navigation]);

  switch (flowState) {
    case sendAARFlowStates.displayingAARToS:
      return <SendAARTosComponent />;
    default:
      return <SendAARLoadingComponent />;
  }
};
