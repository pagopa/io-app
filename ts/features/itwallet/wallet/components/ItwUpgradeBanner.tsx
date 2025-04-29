import { VSpacer } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { ItwHighlightBanner } from "../../common/components/ItwHighlightBanner";
import { itwAuthLevelSelector } from "../../common/store/selectors/preferences";
import { ITW_ROUTES } from "../../navigation/routes";

export const ItwUpgradeBanner = () => {
  const navigation = useIONavigation();
  const authLevel = useIOSelector(itwAuthLevelSelector);

  if (authLevel !== "L2") {
    return null;
  }

  const handleOnPress = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO
    });
  };

  return (
    <>
      <ItwHighlightBanner
        testID="itwUpgradeBannerTestID"
        title={I18n.t("features.itWallet.upgrade.banner.title")}
        description={I18n.t("features.itWallet.upgrade.banner.description")}
        action={I18n.t("features.itWallet.upgrade.banner.action")}
        onPress={handleOnPress}
      />
      <VSpacer size={16} />
    </>
  );
};
