import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList.ts";
import { ItwParamsList } from "../../navigation/ItwParamsList.ts";
import { ItwDiscoveryInfoComponent } from "../components/ItwDiscoveryInfoComponent.tsx";
import { ItwPaywallComponent } from "../components/ItwPaywallComponent.tsx";
import { ItwNfcNotSupportedComponent } from "../components/ItwNfcNotSupportedComponent.tsx";
import { trackItWalletIntroScreen } from "../../analytics/index.ts";
import { useIOSelector } from "../../../../store/hooks.ts";
import { itwHasNfcFeatureSelector } from "../../identification/store/selectors/index.ts";

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

  useFocusEffect(
    useCallback(() => {
      trackItWalletIntroScreen();
    }, [])
  );

  if (!isL3) {
    return <ItwDiscoveryInfoComponent />;
  }

  return <ItwL3DiscoveryInfoComponent />;
};

const ItwL3DiscoveryInfoComponent = () => {
  const hasNfcFeature = useIOSelector(itwHasNfcFeatureSelector);

  if (!hasNfcFeature) {
    return <ItwNfcNotSupportedComponent />;
  }

  return <ItwPaywallComponent />;
};
