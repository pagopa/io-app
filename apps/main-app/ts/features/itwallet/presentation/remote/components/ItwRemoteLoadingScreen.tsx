import I18n from "i18next";

import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent";

type Props = {
  message?: string;
  testID?: string;
  title: string;
};

export const ItwRemoteLoadingScreen = ({ testID, title, message }: Props) => (
  <LoadingScreenContent
    subtitle={
      message ??
      I18n.t("features.itWallet.presentation.remote.loadingScreen.subtitle")
    }
    testID={testID ?? "loader"}
    title={title}
  />
);
