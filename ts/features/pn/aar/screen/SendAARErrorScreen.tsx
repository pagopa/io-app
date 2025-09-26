import { SendAARErrorComponent } from "../components/errors/SendAARErrorComponent";
import { SendAARNotAddresseeComponent } from "../components/errors/SendAARNotAddresseeComponent";
import { useSendAarFlowManager } from "../hooks/useSendAarFlowManager";
import { sendAARFlowStates } from "../utils/stateUtils";

export const SendAARErrorScreen = () => {
  const { currentFlowData } = useSendAarFlowManager();

  if (currentFlowData.type === sendAARFlowStates.notAddresseeFinal) {
    return <SendAARNotAddresseeComponent />;
  } else {
    return <SendAARErrorComponent />;
  }
};
