import I18n from "i18next";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { ITW_ROUTES } from "../../navigation/routes";
import { itwSetActivationBannerHidden } from "../store/actions/preferences";
import { itwShouldRenderUpgradeBannerSelector } from "../store/selectors";
import { ItwEngagementBanner } from "./ItwEngagementBanner";

export const ItwUpgradeBanner = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const isBannerVisible = useIOSelector(itwShouldRenderUpgradeBannerSelector);

  if (!isBannerVisible) {
    return null;
  }

  const handleOnActionPress = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ONBOARDING
    });
  };

  const handleOnClosePress = () => {
    dispatch(itwSetActivationBannerHidden(true));
  };

  return (
    <ItwEngagementBanner
      title={I18n.t("features.itWallet.engagementBanner.activation.title")}
      description={I18n.t(
        "features.itWallet.engagementBanner.activation.description"
      )}
      action={I18n.t("features.itWallet.engagementBanner.activation.action")}
      onActionPress={handleOnActionPress}
      onClosePress={handleOnClosePress}
    />
  );
};
