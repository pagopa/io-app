import { useEffect } from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import PN_ROUTES from "../../navigation/routes";
import { SendAARLoadingComponent } from "../components/SendAARLoadingComponent";
import { SendAARTosComponent } from "../components/SendAARTosComponent";
import { setAarFlowState } from "../store/actions";
import { currentAARFlowData } from "../store/selectors";
import { sendAARFlowStates } from "../utils/stateUtils";

type SendAarInitialFlowScreenT = {
  qrCode: string;
};
export const SendAARInitialFlowScreen = ({
  qrCode
}: SendAarInitialFlowScreenT) => {
  const flowData = useIOSelector(currentAARFlowData);
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const flowStateType = flowData.type;

  useEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, [navigation]);

  useOnFirstRender(() => {
    if (flowStateType === sendAARFlowStates.none) {
      dispatch(
        setAarFlowState({
          type: sendAARFlowStates.displayingAARToS,
          qrCode
        })
      );
    }
  });

  useEffect(() => {
    switch (flowStateType) {
      case sendAARFlowStates.notAddresseeFinal:
      case sendAARFlowStates.ko:
        navigation.replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
          screen: PN_ROUTES.MAIN,
          params: {
            screen: PN_ROUTES.SEND_AAR_ERROR
          }
        });
        break;
      case sendAARFlowStates.displayingNotificationData: {
        navigation.push(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
          screen: PN_ROUTES.MAIN,
          params: {
            screen: PN_ROUTES.MESSAGE_DETAILS,
            params: {
              messageId: flowData.iun,
              firstTimeOpening: true,
              serviceId: flowData.pnServiceId
            }
          }
        });
        break;
      }
    }
  }, [navigation, flowStateType, flowData]);

  switch (flowStateType) {
    case sendAARFlowStates.displayingAARToS:
      return <SendAARTosComponent />;
    default:
      return <SendAARLoadingComponent />;
  }
};
