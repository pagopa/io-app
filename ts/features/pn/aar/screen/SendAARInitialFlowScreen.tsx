import i18n from "i18next";
import { useEffect } from "react";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { SendUserType } from "../../../pushNotifications/analytics";
import PN_ROUTES from "../../navigation/routes";
import { trackSendAARToS } from "../analytics";
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
      case sendAARFlowStates.notAddressee:
        navigation.replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
          screen: PN_ROUTES.MAIN,
          params: {
            screen: PN_ROUTES.SEND_AAR_DELEGATION_PROPOSAL
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
        <LoadingScreenContent
          testID="LoadingScreenContent"
          title={i18n.t("features.pn.aar.flow.fetchingQrData.loadingText")}
        />
      );
  }
};
