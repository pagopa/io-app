import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import i18n from "i18next";
import { useEffect } from "react";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { SendUserType } from "../../../pushNotifications/analytics";
import { PnParamsList } from "../../navigation/params";
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
  const navigation =
    useNavigation<StackNavigationProp<PnParamsList, "PN_QR_SCAN_FLOW">>();
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
        navigation.replace(PN_ROUTES.SEND_AAR_ERROR);
        break;
      case sendAARFlowStates.notAddressee:
        navigation.replace(PN_ROUTES.SEND_AAR_DELEGATION_PROPOSAL);
        break;
      case sendAARFlowStates.displayingNotificationData: {
        const sendUserType: SendUserType =
          flowData.mandateId != null ? "mandatory" : "recipient";
        navigation.replace(PN_ROUTES.MESSAGE_DETAILS, {
          messageId: flowData.iun,
          firstTimeOpening: undefined,
          serviceId: flowData.pnServiceId,
          sendOpeningSource: "aar",
          sendUserType
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
