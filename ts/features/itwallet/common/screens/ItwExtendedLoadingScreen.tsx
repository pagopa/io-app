import I18n from "i18next";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";

export const ItwExtendedLoadingScreen = () => (
  <LoadingScreenContent
    testID="loader"
    contentTitle={I18n.t(`features.itWallet.loadingScreen.title`)}
  />
);
