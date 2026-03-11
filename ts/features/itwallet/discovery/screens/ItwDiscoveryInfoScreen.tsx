import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList.ts";
import { useIOSelector } from "../../../../store/hooks.ts";
import { itwIsActivationDisabledSelector } from "../../common/store/selectors/preferences.ts";
import { isL2Credential } from "../../common/utils/itwCredentialUtils.ts";
import { itwHasNfcFeatureSelector } from "../../identification/common/store/selectors/index.ts";
import { EidIssuanceLevel } from "../../machine/eid/context.ts";
import { ItwParamsList } from "../../navigation/ItwParamsList.ts";
import { ItwDiscoveryInfoComponent } from "../components/ItwDiscoveryInfoComponent.tsx";
import { ItwDiscoveryInfoFallbackComponent } from "../components/ItwDiscoveryInfoFallbackComponent.tsx";
import { ItwDiscoveryInfoLegacyComponent } from "../components/ItwDiscoveryInfoLegacyComponent.tsx";
import { ItwNfcNotSupportedComponent } from "../components/ItwNfcNotSupportedComponent.tsx";
import { ItwL2FallbackComponent } from "../components/ItwL2FallbackComponent.tsx";

export type ItwDiscoveryInfoScreenNavigationParams = {
  level?: EidIssuanceLevel;
  animationEnabled?: boolean;
  credentialType?: string;
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
  const { level = "l2", credentialType } = route.params ?? {};
  const isItWalletActivationDisabled = useIOSelector(
    itwIsActivationDisabledSelector
  );
  const hasNfcFeature = useIOSelector(itwHasNfcFeatureSelector);
  const canContinueWithDocIO = credentialType
    ? isL2Credential(credentialType)
    : false;

  if (level === "l3") {
    if (isItWalletActivationDisabled || !hasNfcFeature) {
      if (canContinueWithDocIO) {
        return <ItwL2FallbackComponent credentialType={credentialType} />;
      }
      // // L3 requires NFC, show not supported screen
      return <ItwNfcNotSupportedComponent />;
    }

    // Discovery screen for It-Wallet
    return <ItwDiscoveryInfoComponent credentialType={credentialType} />;
  }

  if (level === "l2-fallback") {
    // Discovery screen for Documenti su IO coming from IT-Wallet
    return <ItwDiscoveryInfoFallbackComponent />;
  }

  // Discovery screen for Documenti su IO (L2)
  return <ItwDiscoveryInfoLegacyComponent />;
};
