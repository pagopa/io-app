import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useCallback } from "react";
import I18n from "i18next";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import {
  trackItwTapUpgradeBanner,
  trackItwUpgradeBanner
} from "../../analytics";
import { ITW_ROUTES } from "../../navigation/routes";
import { itwShouldRenderL3UpgradeBannerSelector } from "../store/selectors";
import { ItwHighlightBanner } from "./ItwHighlightBanner";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";

export const ItwUpgradeBanner = () => {
  const navigation = useIONavigation();
  const shouldRender = useIOSelector(itwShouldRenderL3UpgradeBannerSelector);
  const isItWalletValid = useIOSelector(itwLifecycleIsValidSelector);
  const { name: routeName } = useRoute();

  useFocusEffect(
    useCallback(() => {
      if (shouldRender) {
        trackItwUpgradeBanner(routeName);
      }
    }, [shouldRender, routeName])
  );

  if (!shouldRender) {
    return null;
  }

  const handleOnPress = () => {
    trackItwTapUpgradeBanner(routeName);
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO,
      params: { isL3: true }
    });
  };

  const isDocumentsActive = isItWalletValid ? "active" : "inactive";

  return (
    <ItwHighlightBanner
      testID="itwUpgradeBannerTestID"
      title={I18n.t(
        `features.itWallet.upgrade.banner.documents.${isDocumentsActive}.title`
      )}
      description={I18n.t(
        `features.itWallet.upgrade.banner.documents.${isDocumentsActive}.description`
      )}
      action={I18n.t(
        `features.itWallet.upgrade.banner.documents.${isDocumentsActive}.action`
      )}
      onPress={handleOnPress}
    />
  );
};
