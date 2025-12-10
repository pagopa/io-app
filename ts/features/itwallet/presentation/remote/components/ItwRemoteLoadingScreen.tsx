import { Body, ContentWrapper } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent";

type Props = {
  testID?: string;
  title: string;
  message?: string;
};

export const ItwRemoteLoadingScreen = ({ testID, title, message }: Props) => (
  <LoadingScreenContent testID={testID ?? "loader"} title={title}>
    <ContentWrapper style={{ alignItems: "center" }}>
      <Body>
        {message ??
          I18n.t(
            "features.itWallet.presentation.remote.loadingScreen.subtitle"
          )}
      </Body>
    </ContentWrapper>
  </LoadingScreenContent>
);
