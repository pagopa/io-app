import { Banner } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { isItwOfflineAccessEnabledSelector } from "../../../../store/reducers/persistedPreferences.ts";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";

export const ItwOfflineWalletBanner = () => {
  const isOfflineAccessEnabled = useIOSelector(
    isItwOfflineAccessEnabledSelector
  );
  const isWalletValid = useIOSelector(itwLifecycleIsValidSelector);

  // Show the banner only if offline access is enabled and the wallet is valid
  if (!isOfflineAccessEnabled || !isWalletValid) {
    return null;
  }

  const handlePress = () => {
    // TODO: [SIW-2309] Implement action when the FAQ are ready
  };

  return (
    <Banner
      testID="itwOfflineWalletBannerTestID"
      title={I18n.t("features.itWallet.discovery.offlineBanner.title")}
      content={I18n.t("features.itWallet.discovery.offlineBanner.content")}
      action={I18n.t("features.itWallet.discovery.offlineBanner.action")}
      pictogramName="notification"
      color="neutral"
      onPress={handlePress}
    />
  );
};
