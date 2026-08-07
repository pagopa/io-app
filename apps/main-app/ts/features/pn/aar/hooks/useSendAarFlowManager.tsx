import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";

import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { PnParamsList } from "../../navigation/params";
import { trackSendAarToSAccepted } from "../analytics";
import { setAarFlowState, terminateAarFlow } from "../store/actions";
import { currentAarFlowData } from "../store/selectors";
import {
  AarFlowState,
  maybeIunFromAarFlowState,
  sendAarFlowStates
} from "../utils/stateUtils";

export type SendAarFlowHandlerType = {
  qrCode: string;
};

type SendAarFlowManager = {
  currentFlowData: AarFlowState;
  goToNextState: () => void;
  terminateFlow: () => void;
};

export const useSendAarFlowManager = (): SendAarFlowManager => {
  const navigation = useNavigation<IOStackNavigationProp<PnParamsList>>();
  const dispatch = useIODispatch();
  const currentFlowData = useIOSelector(currentAarFlowData);

  const handleTerminateFlow = useCallback(() => {
    dispatch(
      terminateAarFlow({
        messageId: maybeIunFromAarFlowState(currentFlowData)
      })
    );
    navigation.popToTop();
  }, [dispatch, navigation, currentFlowData]);

  const goToNextState = () => {
    switch (currentFlowData.type) {
      case sendAarFlowStates.displayingAarToS:
        trackSendAarToSAccepted();
        dispatch(
          setAarFlowState({
            type: sendAarFlowStates.fetchingQRData,
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
