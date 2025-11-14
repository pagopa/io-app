import { useCallback } from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { trackSendAARToSAccepted } from "../analytics";
import { setAarFlowState, terminateAarFlow } from "../store/actions";
import { currentAARFlowData } from "../store/selectors";
import {
  AARFlowState,
  maybeIunFromAarFlowState,
  sendAARFlowStates
} from "../utils/stateUtils";

type SendAarFlowManager = {
  terminateFlow: () => void;
  goToNextState: () => void;
  currentFlowData: AARFlowState;
};

export type SendAarFlowHandlerType = {
  qrCode: string;
};

export const useSendAarFlowManager = (): SendAarFlowManager => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const currentFlowData = useIOSelector(currentAARFlowData);

  const handleTerminateFlow = useCallback(() => {
    dispatch(
      terminateAarFlow({ messageId: maybeIunFromAarFlowState(currentFlowData) })
    );
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
