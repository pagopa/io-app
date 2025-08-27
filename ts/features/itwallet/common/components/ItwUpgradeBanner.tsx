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

export const ItwUpgradeBanner = () => {
  const navigation = useIONavigation();
  const shouldRender = useIOSelector(itwShouldRenderL3UpgradeBannerSelector);
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

  return (
    <ItwHighlightBanner
      testID="itwUpgradeBannerTestID"
      title={I18n.t("features.itWallet.upgrade.banner.title")}
      description={I18n.t("features.itWallet.upgrade.banner.description")}
      action={I18n.t("features.itWallet.upgrade.banner.action")}
      onPress={handleOnPress}
    />
  );
};
