import { useCallback } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { trackSendAARToSAccepted } from "../analytics";
import { setAarFlowState, terminateAarFlow } from "../store/actions";
import { currentAARFlowData } from "../store/selectors";
import {
  AARFlowState,
  maybeIunFromAarFlowState,
  sendAARFlowStates
} from "../utils/stateUtils";
import { PnParamsList } from "../../navigation/params";
import { MESSAGES_STACK_NAVIGATOR_ID } from "../../../messages/navigation/MessagesNavigator";
import { MessagesParamsList } from "../../../messages/navigation/params";

type SendAarFlowManager = {
  terminateFlow: () => void;
  goToNextState: () => void;
  currentFlowData: AARFlowState;
};

export type SendAarFlowHandlerType = {
  qrCode: string;
};

export const useSendAarFlowManager = (): SendAarFlowManager => {
  const navigation =
    useNavigation<
      StackNavigationProp<
        PnParamsList,
        keyof PnParamsList,
        typeof MESSAGES_STACK_NAVIGATOR_ID
      >
    >();
  const dispatch = useIODispatch();
  const currentFlowData = useIOSelector(currentAARFlowData);

  const handleTerminateFlow = useCallback(() => {
    // We retrieve the parent stack's navigation to ensure the entire flow is closed when the flow is terminated
    // If messagesStackNavigation doesn't provide the desired behavior,
    // consider switching to `AuthenticatedStackNavigator`
    const maybeMessagesNavigation =
      navigation.getParent<StackNavigationProp<MessagesParamsList> | undefined>(
        MESSAGES_STACK_NAVIGATOR_ID
      ) ?? navigation;

    dispatch(
      terminateAarFlow({ messageId: maybeIunFromAarFlowState(currentFlowData) })
    );
    maybeMessagesNavigation.popToTop();
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
