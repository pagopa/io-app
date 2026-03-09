import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useEffect } from "react";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { useIOSelector } from "../../../../store/hooks";
import { PnParamsList } from "../../navigation/params";
import PN_ROUTES from "../../navigation/routes";
import { trackSendAARAccessDeniedScreenView } from "../analytics";
import { SendAarGenericErrorComponent } from "../components/errors/SendAARErrorComponent";
import { SendAarNfcNotSupportedComponent } from "../components/errors/SendAarNfcNotSupportedComponent";
import { SendAarNotAddresseeKoComponent } from "../components/errors/SendAarNotAddresseeKoComponent";
import { currentAARFlowData } from "../store/selectors";
import { getAarErrorBehaviour } from "../utils/aarErrorMappings";
import { sendAARFlowStates } from "../utils/stateUtils";

export const SendAARErrorScreen = () => {
  const flowData = useIOSelector(currentAARFlowData);
  const navigation =
    useNavigation<StackNavigationProp<PnParamsList, "SEND_AAR_ERROR">>();
  const { type } = flowData;

  useEffect(() => {
    if (type === sendAARFlowStates.notAddresseeFinal) {
      trackSendAARAccessDeniedScreenView();
    }
  }, [type]);

  useEffect(() => {
    // handle navigation for retryable errors
    if (type === sendAARFlowStates.cieCanAdvisory) {
      navigation.replace(PN_ROUTES.SEND_AAR_CIE_CAN_EDUCATIONAL);
    }
  }, [navigation, type]);

  switch (type) {
    case sendAARFlowStates.notAddresseeFinal: {
      return <SendAarNotAddresseeKoComponent />;
    }
    case sendAARFlowStates.nfcNotSupportedFinal: {
      return <SendAarNfcNotSupportedComponent />;
    }
    case sendAARFlowStates.ko: {
      const { Component: ErrorComponent } = getAarErrorBehaviour(
        flowData.error
      );
      return <ErrorComponent />;
    }
    case sendAARFlowStates.cieCanAdvisory: {
      // navigation handled in useEffect,
      // this is to avoid rendering the default error component while redirecting
      return <LoadingScreenContent title="" />;
    }
    default: {
      return <SendAarGenericErrorComponent />;
    }
  }
};
