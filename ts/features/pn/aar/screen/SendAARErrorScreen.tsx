import { useEffect } from "react";
import { useIOSelector } from "../../../../store/hooks";
import { trackSendAARAccessDeniedScreenView } from "../analytics";
import { SendAarGenericErrorComponent } from "../components/errors/SendAARErrorComponent";
import { SendAarNfcNotSupportedComponent } from "../components/errors/SendAarNfcNotSupportedComponent";
import { SendAarNotAddresseeKoComponent } from "../components/errors/SendAarNotAddresseeKoComponent";
import { currentAARFlowData } from "../store/selectors";
import { getSendAarErrorComponent } from "../utils/aarErrorMappings";
import { sendAARFlowStates } from "../utils/stateUtils";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import PN_ROUTES from "../../navigation/routes";

export const SendAARErrorScreen = () => {
  const flowData = useIOSelector(currentAARFlowData);
  const navigation = useIONavigation();
  const { type } = flowData;

  useEffect(() => {
    // handle navigation for retryable errors
    if (type === sendAARFlowStates.notAddresseeFinal) {
      trackSendAARAccessDeniedScreenView();
    }
  }, [type]);

  useEffect(() => {
    if (type === sendAARFlowStates.cieCanAdvisory) {
      navigation.replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
        screen: PN_ROUTES.MAIN,
        params: {
          screen: PN_ROUTES.SEND_AAR_CIE_CAN_EDUCATIONAL
        }
      });
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
      const ErrorComponent = getSendAarErrorComponent(flowData.error?.errors);
      return <ErrorComponent />;
    }
    default: {
      return <SendAarGenericErrorComponent />;
    }
  }
};
