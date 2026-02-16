import { Banner } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { View } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { ITW_ROUTES } from "../../navigation/routes";
import { itwIsWalletEmptySelector } from "../../credentials/store/selectors";

export const ItwRestrictedModeBanner = () => {
  const navigation = useIONavigation();
  const shouldRender = useIOSelector(itwIsWalletEmptySelector);

  if (!shouldRender) {
    return null;
  }

  const handleOnPress = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ONBOARDING
    });
  };

  return (
    <View style={{ marginHorizontal: -8 }}>
      <Banner
        testID="itwWalletRestrictedModeBannerTestID"
        title={I18n.t("features.wallet.home.screen.restrictedMode.title")}
        content={I18n.t(
          "features.wallet.home.screen.restrictedMode.description"
        )}
        action={I18n.t("features.wallet.home.screen.restrictedMode.cta")}
        color="neutral"
        onPress={handleOnPress}
        pictogramName="cardAdd"
      />
    </View>
  );
};
