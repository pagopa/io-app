import { useNavigation } from "@react-navigation/native";
import I18n from "i18next";
import { useEffect } from "react";

import { LoadingScreenContent } from "../../../../components/screens/LoadingScreenContent";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import {
  isStartupLoaded,
  StartupStatusEnum
} from "../../../../store/reducers/startup";
import {
  isItWalletAvailable,
  ItwLifecycleState,
  itwLifecycleStateSelector
} from "../../lifecycle/store/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

/** Landing screen to route deeplink based on the ITW activation status */
export const ItwDiscoveryLandingScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const lifecycle = useIOSelector(itwLifecycleStateSelector);
  const startupStatus = useIOSelector(isStartupLoaded);

  useEffect(() => {
    if (startupStatus !== StartupStatusEnum.AUTHENTICATED) {
      // Skip navigation until the startup process is completed and the user is authenticated
      return;
    }

    if (
      lifecycle === ItwLifecycleState.VALID_IT_WALLET ||
      lifecycle === ItwLifecycleState.VALID_DOC_IO
    ) {
      navigation.replace(ITW_ROUTES.DISCOVERY.ALREADY_ACTIVE_SCREEN);
      return;
    }

    navigation.replace(ITW_ROUTES.DISCOVERY.INFO, {
      animationEnabled: false,
      level: isItWalletAvailable(lifecycle) ? "l3" : "l2"
    });
  }, [startupStatus, navigation, lifecycle]);

  return <LoadingScreenContent title={I18n.t("global.genericWaiting")} />;
};
