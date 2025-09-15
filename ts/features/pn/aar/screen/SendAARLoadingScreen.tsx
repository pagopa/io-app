import { useEffect } from "react";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { setAarFlowState } from "../store/actions";
import { currentAARFlowData, sendAARFlowStates } from "../store/reducers";

export const SendAARLoadingScreen = () => {
  const dispatch = useIODispatch();
  const flowData = useIOSelector(currentAARFlowData);

  useEffect(() => {
    const flowState = flowData.type;
    if (flowState === sendAARFlowStates.displayingAARToS) {
      // this skips the screen for now
      dispatch(
        setAarFlowState({
          type: sendAARFlowStates.fetchingQRData,
          qrCode: flowData.qrCode
        })
      );
    }
  }, [dispatch, flowData]);

  return <LoadingScreenContent contentTitle="" />;
};
