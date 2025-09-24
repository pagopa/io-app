import { SendAARErrorComponent } from "../components/errors/SendAARErrorComponent";
import { SendAARNotAddresseeComponent } from "../components/errors/SendAARNotAddresseeComponent";
import { useSendAarFlowManager } from "../hooks/useSendAarFlowManager";
import { sendAARFlowStates } from "../utils/stateUtils";

export const SendAARErrorScreen = () => {
  const { currentFlowData } = useSendAarFlowManager();

  switch (currentFlowData.type) {
    case sendAARFlowStates.notAddresseeFinal:
      return <SendAARNotAddresseeComponent />;
    default:
      return <SendAARErrorComponent />;
  }
};
