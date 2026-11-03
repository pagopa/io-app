import { Banner } from "@io-app/design-system";

import { useOfflineToastGuard } from "../../../../hooks/useOfflineToastGuard";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

export const ItwNonDismissibleUpgradeBanner = () => {
  const navigation = useIONavigation();

  const navigateToDiscoveryScreen = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO,
      params: { level: "l3" }
    });
  };

  const guardedNavigateToDiscoveryScreen = useOfflineToastGuard(
    navigateToDiscoveryScreen
  );

  return (
    <Banner
      action={"Inizia"}
      color="neutral"
      content={
        // eslint-disable-next-line
        "Continua a usare i tuoi documenti su IO e aggiungine di nuovi, con funzionalità più avanzate."
      }
      onPress={guardedNavigateToDiscoveryScreen}
      pictogramName="premiumCredentials"
      testID="itwReactivationBannerTestID"
      // eslint-disable-next-line
      title={"Attiva IT-Wallet per non perdere i tuoi documenti"}
    />
  );
};
