import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { ITW_ROUTES } from "../../navigation/routes";
import { itwShouldRenderL3UpgradeBannerSelector } from "../store/selectors";
import { ItwHighlightBanner } from "./ItwHighlightBanner";

export const ItwUpgradeBanner = () => {
  const navigation = useIONavigation();
  const shouldRender = useIOSelector(itwShouldRenderL3UpgradeBannerSelector);

  if (!shouldRender) {
    return null;
  }

  const handleOnPress = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO
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
