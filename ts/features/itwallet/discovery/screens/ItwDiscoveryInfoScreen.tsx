import { useCallback } from "react";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList.ts";
import { useIOSelector } from "../../../../store/hooks.ts";
import { trackItWalletActivationStart } from "../../analytics/index.ts";
import { itwHasNfcFeatureSelector } from "../../identification/common/store/selectors/index.ts";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider.tsx";
import { ItwParamsList } from "../../navigation/ItwParamsList.ts";
import { ItwDiscoveryInfoComponent } from "../components/ItwDiscoveryInfoComponent.tsx";
import { ItwDiscoveryInfoLegacyComponent } from "../components/ItwDiscoveryInfoLegacyComponent.tsx";
import { ItwNfcNotSupportedComponent } from "../components/ItwNfcNotSupportedComponent.tsx";

export type ItwDiscoveryInfoScreenNavigationParams = {
  isL3?: boolean;
  animationEnabled?: boolean;
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

  const handleContinuePress = useCallback(() => {
    trackItWalletActivationStart(isL3 ? "L3" : "L2");
    machineRef.send({ type: "accept-tos" });
  }, [machineRef, isL3]);

  if (!isL3) {
    return (
      <ItwDiscoveryInfoLegacyComponent onContinuePress={handleContinuePress} />
    );
  }

  if (!hasNfcFeature) {
    return <ItwNfcNotSupportedComponent />;
  }

  return <ItwDiscoveryInfoComponent />;
};
