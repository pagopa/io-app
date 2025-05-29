import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import {
  trackItWalletIDMethod,
  trackItWalletIDMethodSelected
} from "../../analytics";
import { L2IdentificationView } from "../components/DefaultIdentificationView.tsx";

/*export type ItwIdentificationModeSelectionScreenNavigationParams = {
  eidReissuing?: boolean;
};

export type ItwIdentificationModeSelectionScreenProps =
  IOStackNavigationRouteProps<
    ItwParamsList,
    "ITW_IDENTIFICATION_LEVEL_SELECTION_L2"
  >;*/

export const ItwL2IdentificationModeSelectionScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  /*  const { eidReissuing } = props.route.params;

  useFocusEffect(
    useCallback(() => {
      if (eidReissuing) {
        machineRef.send({ type: "start-reissuing" });
      }
    }, [eidReissuing, machineRef])
  );*/
  useFocusEffect(trackItWalletIDMethod);

  const handleSpidPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "spid" });
    trackItWalletIDMethodSelected({ ITW_ID_method: "spid" });
  }, [machineRef]);

  const handleCieIdPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "cieId" });
    trackItWalletIDMethodSelected({ ITW_ID_method: "cieId" });
  }, [machineRef]);

  return (
    <L2IdentificationView
      onSpidPress={handleSpidPress}
      onCieIdPress={handleCieIdPress}
    />
  );
};
