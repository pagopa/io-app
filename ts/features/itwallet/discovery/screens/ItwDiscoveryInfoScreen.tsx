import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList.ts";
import { useIOSelector } from "../../../../store/hooks.ts";
import { CredentialType } from "../../common/utils/itwMocksUtils.ts";
import { itwHasNfcFeatureSelector } from "../../identification/common/store/selectors/index.ts";
import { EidIssuanceLevel } from "../../machine/eid/context.ts";
import { ItwParamsList } from "../../navigation/ItwParamsList.ts";
import { ItwDiscoveryInfoComponent } from "../components/ItwDiscoveryInfoComponent.tsx";
import { ItwDiscoveryInfoFallbackComponent } from "../components/ItwDiscoveryInfoFallbackComponent.tsx";
import { ItwDiscoveryInfoLegacyComponent } from "../components/ItwDiscoveryInfoLegacyComponent.tsx";
import { ItwNfcNotSupportedComponent } from "../components/ItwNfcNotSupportedComponent.tsx";
import { ItwRestrictedModeFallbackComponent } from "../components/ItwRestrictedModeFallbackComponent.tsx";

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
  const hasNfcFeature = useIOSelector(itwHasNfcFeatureSelector);
  const canContinueWithDocIO =
    credentialType === CredentialType.DRIVING_LICENSE ||
    credentialType === CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD ||
    credentialType === CredentialType.EUROPEAN_DISABILITY_CARD;

  if (level === "l3") {
    if (!hasNfcFeature) {
      if (canContinueWithDocIO) {
        // L2 does not require NFC, show Documenti su IO fallback
        return <ItwRestrictedModeFallbackComponent />;
      } else {
        // L3 requires NFC, show not supported screen
        return <ItwNfcNotSupportedComponent />;
      }
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
