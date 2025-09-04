import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import I18n from "../../../../i18n";

export const ItwExtendedLoadingScreen = () => (
    <LoadingScreenContent
      testID="loader"
      contentTitle={I18n.t(`features.itWallet.loadingScreen.title`)}
    />
  );
