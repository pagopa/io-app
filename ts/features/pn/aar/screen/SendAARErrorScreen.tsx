import { useIOSelector } from "../../../../store/hooks";
import { SendAARErrorComponent } from "../components/errors/SendAARErrorComponent";
import { SendAARNotAddresseeComponent } from "../components/errors/SendAARNotAddresseeComponent";
import { currentAARFlowStateType } from "../store/selectors";
import { sendAARFlowStates } from "../utils/stateUtils";

export const SendAARErrorScreen = () => {
  const flowType = useIOSelector(currentAARFlowStateType);

  if (flowType === sendAARFlowStates.notAddresseeFinal) {
    return <SendAARNotAddresseeComponent />;
  } else {
    return <SendAARErrorComponent />;
  }
};
