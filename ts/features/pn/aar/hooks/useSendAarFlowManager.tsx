import { useCallback } from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { setAarFlowState, terminateAarFlow } from "../store/actions";
import { currentAARFlowData } from "../store/selectors";
import { AARFlowState, sendAARFlowStates } from "../utils/stateUtils";
import { isTestEnv } from "../../../../utils/environment";
import { trackSendAARToSAccepted } from "../analytics";

type SendAarFlowManager = {
  terminateFlow: () => void;
  goToNextState: () => void;
  currentFlowData: AARFlowState;
};

export type SendAarFlowHandlerType = {
  qrCode: string;
};

const getIun = (data: AARFlowState): string | undefined => {
  switch (data.type) {
    case sendAARFlowStates.notAddresseeFinal:
    case sendAARFlowStates.fetchingNotificationData:
    case sendAARFlowStates.displayingNotificationData:
      return data.iun;
    case sendAARFlowStates.ko:
      return getIun(data.previousState);
    default:
      return undefined;
  }
};
export const useSendAarFlowManager = (): SendAarFlowManager => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const currentFlowData = useIOSelector(currentAARFlowData);

  const handleTerminateFlow = useCallback(() => {
    dispatch(terminateAarFlow({ messageId: getIun(currentFlowData) }));
    navigation.popToTop();
  }, [dispatch, navigation, currentFlowData]);

  const goToNextState = () => {
    switch (currentFlowData.type) {
      case sendAARFlowStates.displayingAARToS:
        trackSendAARToSAccepted();
        dispatch(
          setAarFlowState({
            type: sendAARFlowStates.fetchingQRData,
            qrCode: currentFlowData.qrCode
          })
        );
        break;
    }
  };

  return {
    terminateFlow: handleTerminateFlow,
    goToNextState,
    currentFlowData
  };
};
export const testable = isTestEnv ? { getIun } : {};
