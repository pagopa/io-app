import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import {
  trackItWalletIDMethod,
  trackItWalletIDMethodSelected
} from "../../analytics";
import { L3IdentificationView } from "../components/L3IdentificationView.tsx";

export type ItwIdentificationModeSelectionScreenNavigationParams = {
  eidReissuing?: boolean;
};

export type ItwIdentificationModeSelectionScreenProps =
  IOStackNavigationRouteProps<
    ItwParamsList,
    "ITW_IDENTIFICATION_LEVEL_SELECTION_L3"
  >;

export const ItwL3IdentificationModeSelectionScreen = (
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

  const handleCiePinPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "ciePin" });
    trackItWalletIDMethodSelected({ ITW_ID_method: "ciePin" });
  }, [machineRef]);

  const handleCieIdPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "cieId" });
    trackItWalletIDMethodSelected({ ITW_ID_method: "cieId" });
  }, [machineRef]);

  return (
    <L3IdentificationView
      handleCiePinPress={handleCiePinPress}
      handleCieIdPress={handleCieIdPress}
    />
  );
};
