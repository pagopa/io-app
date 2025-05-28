import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import { isL3FeaturesEnabledSelector } from "../../machine/eid/selectors.ts";
import {
  trackItWalletIDMethod,
  trackItWalletIDMethodSelected
} from "../../analytics";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { L3IdentificationView } from "../components/L3IdentificationView.tsx";
import { DefaultIdentificationView } from "../components/DefaultIdentificationView.tsx";

export type ItwIdentificationModeSelectionScreenNavigationParams = {
  eidReissuing?: boolean;
};

export type ItwIdentificationModeSelectionScreenProps =
  IOStackNavigationRouteProps<
    ItwParamsList,
    "ITW_IDENTIFICATION_MODE_SELECTION"
  >;

export const ItwIdentificationModeSelectionScreen = (
  props: ItwIdentificationModeSelectionScreenProps
) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isL3Enabled = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );

  const { eidReissuing } = props.route.params;

  useFocusEffect(
    useCallback(() => {
      if (eidReissuing) {
        machineRef.send({ type: "start-reissuing" });
      }
    }, [eidReissuing, machineRef])
  );
  useFocusEffect(trackItWalletIDMethod);

  const handleSpidPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "spid" });
    trackItWalletIDMethodSelected({ ITW_ID_method: "spid" });
  }, [machineRef]);

  const handleCiePinPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "ciePin" });
    trackItWalletIDMethodSelected({ ITW_ID_method: "ciePin" });
  }, [machineRef]);

  const handleCieIdPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "cieId" });
    trackItWalletIDMethodSelected({ ITW_ID_method: "cieId" });
  }, [machineRef]);

  return isL3Enabled ? (
    <L3IdentificationView
      handleCiePinPress={handleCiePinPress}
      handleCieIdPress={handleCieIdPress}
    />
  ) : (
    <DefaultIdentificationView
      onSpidPress={handleSpidPress}
      onCiePinPress={handleCiePinPress}
      onCieIdPress={handleCieIdPress}
    />
  );
};
