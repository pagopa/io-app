import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import {
  IOStackNavigationProp,
  IOStackNavigationRouteProps
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { itwIsL3EnabledSelector } from "../../common/store/selectors/preferences";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

export type ItwIssuanceCredentialLandingScreennNavigationParams = {
  credentialType?: string;
};

export type ItwIssuanceCredentialLandingScreenProps =
  IOStackNavigationRouteProps<
    ItwParamsList,
    "ITW_LANDING_SCREEN_CREDENTIAL_ISSUANCE"
  >;

/**
 * anding screen to route credential issuance deeplink based on the ITW activation status and level
 */
export const ItwIssuanceCredentialLandingScreen = ({
  route
}: ItwIssuanceCredentialLandingScreenProps) => {
  const { credentialType } = route.params;

  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);
  const isWhitelisted = useIOSelector(itwIsL3EnabledSelector);

  useEffect(() => {
    if (isItwValid) {
      navigation.replace(ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER, {
        credentialType
      });
      return;
    }

    navigation.replace(ITW_ROUTES.DISCOVERY.INFO, {
      animationEnabled: false,
      level: isWhitelisted ? "l3" : "l2",
      credentialType
    });
  }, [navigation, isItwValid, isWhitelisted, credentialType]);

  return null;
};
