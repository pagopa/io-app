import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { itwIsL3EnabledSelector } from "../../common/store/selectors/preferences";
import {
  itwLifecycleIsITWalletValidSelector,
  itwLifecycleIsValidSelector
} from "../../lifecycle/store/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

/**
 * Landing screen to route deeplink based on the ITW activation status
 */
export const ItwDiscoveryLandingScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const isWalletActive = useIOSelector(itwLifecycleIsValidSelector);
  const isItWalletActive = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const isWhitelisted = useIOSelector(itwIsL3EnabledSelector);

  useEffect(() => {
    if (isItWalletActive || (isWalletActive && !isWhitelisted)) {
      navigation.replace(ITW_ROUTES.DISCOVERY.ALREADY_ACTIVE_SCREEN);
      return;
    }

    navigation.replace(ITW_ROUTES.DISCOVERY.INFO, {
      animationEnabled: false,
      level: isWhitelisted ? "l3" : "l2"
    });
  }, [navigation, isWalletActive, isItWalletActive, isWhitelisted]);

  return null;
};
