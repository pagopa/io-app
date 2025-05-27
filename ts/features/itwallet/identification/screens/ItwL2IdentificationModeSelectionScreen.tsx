import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import {
  trackItWalletIDMethod,
  trackItWalletIDMethodSelected
} from "../../analytics";
import { DefaultIdentificationView } from "../components/DefaultIdentificationView.tsx";

export type ItwIdentificationModeSelectionScreenNavigationParams = {
  eidReissuing?: boolean;
};

export type ItwIdentificationModeSelectionScreenProps =
  IOStackNavigationRouteProps<
    ItwParamsList,
    "ITW_IDENTIFICATION_LEVEL_SELECTION_L2"
  >;

export const ItwDefaultIdentificationModeSelectionScreen = (
  props: ItwIdentificationModeSelectionScreenProps
) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const { eidReissuing } = props.route.params;

  useFocusEffect(
    useCallback(() => {
      if (eidReissuing) {
        machineRef.send({ type: "start-reissuing" });
      }
    }, [eidReissuing, machineRef])
  );
  useFocusEffect(trackItWalletIDMethod);

  const handleSpidPress = () => {
    machineRef.send({ type: "select-identification-mode", mode: "spid" });
    trackItWalletIDMethodSelected({ ITW_ID_method: "spid" });
  };

  const handleCieIdPress = () => {
    machineRef.send({ type: "select-identification-mode", mode: "cieId" });
    trackItWalletIDMethodSelected({ ITW_ID_method: "cieId" });
  };

  return (
    <DefaultIdentificationView
      onSpidPress={handleSpidPress}
      onCieIdPress={handleCieIdPress}
    />
  );
};
