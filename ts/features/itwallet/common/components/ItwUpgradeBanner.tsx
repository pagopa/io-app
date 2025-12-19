import I18n from "i18next";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import {
  itwIsMdlPresentSelector,
  itwIsWalletEmptySelector
} from "../../credentials/store/selectors";
import { ITW_ROUTES } from "../../navigation/routes";
import { itwShouldRenderUpgradeBannerSelector } from "../store/selectors";
import { ItwEngagementBanner } from "./ItwEngagementBanner";

export const ItwUpgradeBanner = () => {
  const navigation = useIONavigation();

  const isBannerVisible = useIOSelector(itwShouldRenderUpgradeBannerSelector);
  const isWalletEmpty = useIOSelector(itwIsWalletEmptySelector);
  const hasMdl = useIOSelector(itwIsMdlPresentSelector);

  if (!isBannerVisible) {
    return null;
  }

  const handleAddDocumentPress = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ONBOARDING
    });
  };

  const handleStartPress = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO,
      params: { level: "l3" }
    });
  };

  const handleOnDismiss = () => {
    // TODO SIW-3564 implement banner dismissal logic
  };

  if (isWalletEmpty) {
    return (
      <ItwEngagementBanner
        title={I18n.t("features.itWallet.engagementBanner.upgrade_empty.title")}
        description={I18n.t(
          "features.itWallet.engagementBanner.upgrade_empty.description"
        )}
        action={I18n.t(
          "features.itWallet.engagementBanner.upgrade_empty.action"
        )}
        onPress={handleAddDocumentPress}
        onDismiss={handleOnDismiss}
      />
    );
  }

  if (hasMdl) {
    return (
      <ItwEngagementBanner
        title={I18n.t(
          "features.itWallet.engagementBanner.upgrade_with_mdl.title"
        )}
        description={I18n.t(
          "features.itWallet.engagementBanner.upgrade_with_mdl.description"
        )}
        action={I18n.t(
          "features.itWallet.engagementBanner.upgrade_with_mdl.action"
        )}
        onPress={handleStartPress}
        onDismiss={handleOnDismiss}
        dismissable={true}
      />
    );
  }

  return (
    <ItwEngagementBanner
      title={I18n.t("features.itWallet.engagementBanner.upgrade.title")}
      description={I18n.t(
        "features.itWallet.engagementBanner.upgrade.description"
      )}
      action={I18n.t("features.itWallet.engagementBanner.upgrade.action")}
      onPress={handleStartPress}
      onDismiss={handleOnDismiss}
      dismissable={true}
    />
  );
};
