import I18n from "i18next";
import { View } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { ITW_ROUTES } from "../../navigation/routes";
import { itwSetActivationBannerHidden } from "../store/actions/preferences";
import { itwShouldRenderActivationBannerSelector } from "../store/selectors";
import { ItwEngagementBanner } from "./ItwEngagementBanner";

export const ItwActivationBanner = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const isBannerVisible = useIOSelector(
    itwShouldRenderActivationBannerSelector
  );

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
    <View testID="itwActivationBannerTestID" style={{ marginVertical: 16 }}>
      <ItwEngagementBanner
        title={I18n.t("features.itWallet.engagementBanner.activation.title")}
        description={I18n.t(
          "features.itWallet.engagementBanner.activation.description"
        )}
        action={I18n.t("features.itWallet.engagementBanner.activation.action")}
        onActionPress={handleOnActionPress}
        onClosePress={handleOnClosePress}
      />
    </View>
  );
};
