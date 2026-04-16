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
import { trackSendAarToS } from "../analytics";
import { SendAarTosComponent } from "../components/SendAarTosComponent";
import { setAarFlowState } from "../store/actions";
import { currentAarFlowData } from "../store/selectors";
import { sendAarFlowStates } from "../utils/stateUtils";

type SendAarInitialFlowScreenT = {
  qrCode: string;
};
export const SendAarInitialFlowScreen = ({
  qrCode
}: SendAarInitialFlowScreenT) => {
  const flowData = useIOSelector(currentAarFlowData);
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
    if (flowStateType === sendAarFlowStates.none) {
      dispatch(
        setAarFlowState({
          type: sendAarFlowStates.displayingAarToS,
          qrCode
        })
      );
    }
  });

  useEffect(() => {
    switch (flowStateType) {
      case sendAarFlowStates.notAddresseeFinal:
      case sendAarFlowStates.ko:
        navigation.replace(PN_ROUTES.SEND_AAR_ERROR);
        break;
      case sendAarFlowStates.notAddressee:
        navigation.replace(PN_ROUTES.SEND_AAR_DELEGATION_PROPOSAL);
        break;
      case sendAarFlowStates.displayingNotificationData: {
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
      case sendAarFlowStates.displayingAarToS: {
        trackSendAarToS();
        break;
      }
    }
  }, [navigation, flowStateType, flowData]);

  switch (flowStateType) {
    case sendAarFlowStates.displayingAarToS:
      return <SendAarTosComponent />;
    default:
      return (
        <LoadingScreenContent
          testID="LoadingScreenContent"
          title={i18n.t("features.pn.aar.flow.fetchingQrData.loadingText")}
        />
      );
  }
};
