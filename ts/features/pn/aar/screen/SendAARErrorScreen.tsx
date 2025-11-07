import { useEffect } from "react";
import { useIOSelector } from "../../../../store/hooks";
import { SendAARErrorComponent } from "../components/errors/SendAARErrorComponent";
import { SendAARNotAddresseeComponent } from "../components/errors/SendAARNotAddresseeComponent";
import { currentAARFlowStateType } from "../store/selectors";
import { sendAARFlowStates } from "../utils/stateUtils";
import { trackSendAARAccessDeniedScreenView } from "../analytics";

export const SendAARErrorScreen = () => {
  const flowType = useIOSelector(currentAARFlowStateType);

  useEffect(() => {
    if (flowType === sendAARFlowStates.notAddresseeFinal) {
      trackSendAARAccessDeniedScreenView();
    }
  }, [flowType]);

  if (flowType === sendAARFlowStates.notAddresseeFinal) {
    return <SendAARNotAddresseeComponent />;
  } else {
    return <SendAARErrorComponent />;
  }
};
