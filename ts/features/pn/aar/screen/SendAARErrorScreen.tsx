import { useEffect } from "react";
import { useIOSelector } from "../../../../store/hooks";
import { trackSendAARAccessDeniedScreenView } from "../analytics";
import { SendAARErrorComponent } from "../components/errors/SendAARErrorComponent";
import { SendAarNfcNotSupportedComponent } from "../components/errors/SendAarNfcNotSupportedComponent";
import { SendAarNotAddresseeKoComponent } from "../components/errors/SendAarNotAddresseeKoComponent";
import { currentAARFlowStateType } from "../store/selectors";
import { sendAARFlowStates } from "../utils/stateUtils";

export const SendAARErrorScreen = () => {
  const flowType = useIOSelector(currentAARFlowStateType);

  useEffect(() => {
    if (flowType === sendAARFlowStates.notAddresseeFinal) {
      trackSendAARAccessDeniedScreenView();
    }
  }, [flowType]);

  switch (flowType) {
    case sendAARFlowStates.notAddresseeFinal: {
      return <SendAarNotAddresseeKoComponent />;
    }
    case sendAARFlowStates.nfcNotSupportedFinal: {
      return <SendAarNfcNotSupportedComponent />;
    }
    default: {
      return <SendAARErrorComponent />;
    }
  }
};
