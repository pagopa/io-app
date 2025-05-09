import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useIOSelector } from "../../../../store/hooks";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import {
  trackItWalletIDMethod,
  trackItWalletIDMethodSelected
} from "../../analytics";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { itwIsL3EnabledAndFiscalCodeWhitelistedSelector } from "../../common/store/selectors/preferences.ts";
import { L3IdentificationView } from "../components/L3IdentificationView.tsx";
import { DefaultIdentificationView } from "../components/DefaultIdentificationView.tsx";

export type ItwIdentificationModeSelectionScreenNavigationParams = {
  eidReissuing?: boolean;
};

type ScreenProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_IDENTIFICATION_MODE_SELECTION"
>;

export const ItwIdentificationModeSelectionScreen = (params: ScreenProps) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isL3Enabled = useIOSelector(
    itwIsL3EnabledAndFiscalCodeWhitelistedSelector
  );

  const { eidReissuing } = params.route.params;

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
