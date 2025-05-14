import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList.ts";
import { ItwEidIssuanceMachineContext } from "../../machine/provider.tsx";
import { ItwParamsList } from "../../navigation/ItwParamsList.ts";
import { ItwDiscoveryInfoComponent } from "../components/ItwDiscoveryInfoComponent.tsx";
import { ItwPaywallComponent } from "../components/ItwPaywallComponent.tsx";
import {
  trackItWalletActivationStart,
  trackItWalletIntroScreen
} from "../../analytics/index.ts";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender.ts";

export type ItwDiscoveryInfoScreenNavigationParams = {
  isL3?: boolean;
};

export type ItwDiscoveryInfoScreenProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_DISCOVERY_INFO"
>;

/**
 * Screen displaying information about the discovery process for DIW activation.
 */
export const ItwDiscoveryInfoScreen = ({
  route
}: ItwDiscoveryInfoScreenProps) => {
  const { isL3 = false } = route.params;

  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  useFocusEffect(
    useCallback(() => {
      trackItWalletIntroScreen();
    }, [])
  );

  useOnFirstRender(() => {
    machineRef.send({ type: "start", isL3 });
  });

  const handleContinuePress = useCallback(() => {
    trackItWalletActivationStart();
    machineRef.send({ type: "accept-tos" });
  }, [machineRef]);

  if (!isL3) {
    return <ItwDiscoveryInfoComponent onContinuePress={handleContinuePress} />;
  }

  return <ItwPaywallComponent onContinuePress={handleContinuePress} />;
};
