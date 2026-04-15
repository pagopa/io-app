import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useEffect } from "react";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { useIOSelector } from "../../../../store/hooks";
import { PnParamsList } from "../../navigation/params";
import PN_ROUTES from "../../navigation/routes";
import { trackSendAarAccessDeniedScreenView } from "../analytics";
import { SendAarGenericErrorComponent } from "../components/errors/SendAarErrorComponent";
import { SendAarNfcNotSupportedComponent } from "../components/errors/SendAarNfcNotSupportedComponent";
import { SendAarNotAddresseeKoComponent } from "../components/errors/SendAarNotAddresseeKoComponent";
import { currentAarFlowData } from "../store/selectors";
import { getAarErrorBehaviour } from "../utils/aarErrorMappings";
import { sendAarFlowStates } from "../utils/stateUtils";

export const SendAarErrorScreen = () => {
  const flowData = useIOSelector(currentAarFlowData);
  const navigation =
    useNavigation<StackNavigationProp<PnParamsList, "SEND_AAR_ERROR">>();
  const { type } = flowData;

  useEffect(() => {
    if (type === sendAarFlowStates.notAddresseeFinal) {
      trackSendAarAccessDeniedScreenView();
    }
  }, [type]);

  useEffect(() => {
    // handle navigation for retryable errors
    if (type === sendAarFlowStates.cieCanAdvisory) {
      navigation.replace(PN_ROUTES.SEND_AAR_CIE_CAN_EDUCATIONAL);
    }
  }, [navigation, type]);

  switch (type) {
    case sendAarFlowStates.notAddresseeFinal: {
      return <SendAarNotAddresseeKoComponent />;
    }
    case sendAarFlowStates.nfcNotSupportedFinal: {
      return <SendAarNfcNotSupportedComponent />;
    }
    case sendAarFlowStates.ko: {
      const { Component: ErrorComponent } = getAarErrorBehaviour(
        flowData.error
      );
      return <ErrorComponent />;
    }
    case sendAarFlowStates.cieCanAdvisory: {
      // navigation handled in useEffect,
      // this is to avoid rendering the default error component while redirecting
      return <LoadingScreenContent title="" />;
    }
    default: {
      return <SendAarGenericErrorComponent />;
    }
  }
};
