import { useCallback } from "react";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList.ts";
import { ItwParamsList } from "../../navigation/ItwParamsList.ts";
import { ItwDiscoveryInfoComponent } from "../components/ItwDiscoveryInfoComponent.tsx";
import { ItwPaywallComponent } from "../components/ItwPaywallComponent.tsx";
import { ItwNfcNotSupportedComponent } from "../components/ItwNfcNotSupportedComponent.tsx";
import { trackItWalletActivationStart } from "../../analytics/index.ts";
import { useIOSelector } from "../../../../store/hooks.ts";
import { itwHasNfcFeatureSelector } from "../../identification/store/selectors/index.ts";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender.ts";
import { ItwEidIssuanceMachineContext } from "../../machine/provider.tsx";

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
  const { isL3 = false } = route.params ?? {};

  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const hasNfcFeature = useIOSelector(itwHasNfcFeatureSelector);

  useOnFirstRender(() => {
    if (!isL3) {
      machineRef.send({ type: "start", isL3: false });
      return;
    }

    if (hasNfcFeature) {
      machineRef.send({ type: "start", isL3: true });
    }
  });

  const handleContinuePress = useCallback(() => {
    trackItWalletActivationStart(isL3 ? "L3" : "L2");
    machineRef.send({ type: "accept-tos" });
  }, [machineRef, isL3]);

  if (!isL3) {
    return <ItwDiscoveryInfoComponent onContinuePress={handleContinuePress} />;
  }

  if (!hasNfcFeature) {
    return <ItwNfcNotSupportedComponent />;
  }

  return <ItwPaywallComponent onContinuePress={handleContinuePress} />;
};
