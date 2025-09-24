import { useCallback } from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { sendAARDelegateUrlSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { openWebUrl } from "../../../../utils/url";
import { setAarFlowState, terminateAarFlow } from "../store/actions";
import { currentAARFlowData, currentAARFlowErrorKind } from "../store/reducers";
import {
  AARFlowState,
  ErrorKind,
  isAarErrorRetriable,
  sendAARFlowStates
} from "../utils/stateUtils";

type SendAarFlowManager = {
  terminateFlow: () => void;
  goToNextState: () => void;
  currentFlowData: AARFlowState;
  currentFlowErrorKind?: ErrorKind;
};

export type SendAarFlowHandlerType = {
  qrCode: string;
};

export const useSendAarFlowManager = (): SendAarFlowManager => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const currentFlowData = useIOSelector(currentAARFlowData);
  const delegateUrl = useIOSelector(sendAARDelegateUrlSelector);
  const currentFlowErrorKind = useIOSelector(currentAARFlowErrorKind);

  const handleTerminateFlow = useCallback(() => {
    dispatch(terminateAarFlow());
    navigation.popToTop();
  }, [dispatch, navigation]);

  const goToNextState = () => {
    switch (currentFlowData.type) {
      case sendAARFlowStates.displayingAARToS:
        dispatch(
          setAarFlowState({
            type: sendAARFlowStates.fetchingQRData,
            qrCode: currentFlowData.qrCode
          })
        );
        break;
      case sendAARFlowStates.notAddresseeFinal:
        openWebUrl(delegateUrl);
        break;
      case sendAARFlowStates.ko:
        if (isAarErrorRetriable(currentFlowData.errorKind)) {
          dispatch(setAarFlowState(currentFlowData.previousState));
        }
        break;
    }
  };

  return {
    terminateFlow: handleTerminateFlow,
    goToNextState,
    currentFlowData,
    currentFlowErrorKind
  };
};
