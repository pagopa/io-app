import I18n from "i18next";
import { View } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { ITW_ROUTES } from "../../navigation/routes";
import { itwShouldRenderActivationBannerSelector } from "../store/selectors";
import { ItwEngagementBanner } from "./ItwEngagementBanner";

/**
 * Banner displayed to users which are able to activate IT-Wallet.
 * If the user taps on the action button, they will be redirected to the IT-Wallet credential onboarding screen.
 * The wallet activiation si contextual to the credential issuance flow.
 */
export const ItwActivationBanner = () => {
  const navigation = useIONavigation();

  const isBannerVisible = useIOSelector(
    itwShouldRenderActivationBannerSelector
  );

  if (!isBannerVisible) {
    return null;
  }

  const handleOnPress = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ONBOARDING
    });
  };

  const handleDismiss = () => {
    // TODO implement banner dismissal logic
  };

  return (
    <View testID="itwActivationBannerTestID" style={{ marginVertical: 16 }}>
      <ItwEngagementBanner
        title={I18n.t("features.itWallet.engagementBanner.activation.title")}
        description={I18n.t(
          "features.itWallet.engagementBanner.activation.description"
        )}
        action={I18n.t("features.itWallet.engagementBanner.activation.action")}
        onPress={handleOnPress}
        onDismiss={handleDismiss}
        dismissable={true}
      />
    </View>
  );
};
