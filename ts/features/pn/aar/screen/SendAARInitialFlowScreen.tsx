import { useEffect } from "react";
import i18n from "i18next";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import PN_ROUTES from "../../navigation/routes";
import { SendAARLoadingComponent } from "../components/SendAARLoadingComponent";
import { SendAARTosComponent } from "../components/SendAARTosComponent";
import { setAarFlowState } from "../store/actions";
import { currentAARFlowData } from "../store/selectors";
import { trackSendAARToS } from "../analytics";
import { SendUserType } from "../../../pushNotifications/analytics";
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
      case sendAARFlowStates.notAddressee:
        navigation.replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
          screen: PN_ROUTES.MAIN,
          params: {
            screen: PN_ROUTES.SEND_AAR_DELEGATION_PROPOSAL,
            params: flowData
          }
        });
        break;
      case sendAARFlowStates.displayingNotificationData: {
        const sendUserType: SendUserType =
          flowData.mandateId != null ? "mandatory" : "recipient";
        navigation.replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
          screen: PN_ROUTES.MAIN,
          params: {
            screen: PN_ROUTES.MESSAGE_DETAILS,
            params: {
              messageId: flowData.iun,
              firstTimeOpening: undefined,
              serviceId: flowData.pnServiceId,
              sendOpeningSource: "aar",
              sendUserType
            }
          }
        });
        break;
      }
      case sendAARFlowStates.displayingAARToS: {
        trackSendAARToS();
        break;
      }
    }
  }, [navigation, flowStateType, flowData]);

  switch (flowStateType) {
    case sendAARFlowStates.displayingAARToS:
      return <SendAARTosComponent />;
    default:
      return (
        <SendAARLoadingComponent
          contentTitle={i18n.t(
            "features.pn.aar.flow.fetchingQrData.loadingText"
          )}
        />
      );
  }
};
