import { Body, ContentWrapper } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent";

type Props = {
  title: string;
  message?: string;
};

export const ItwRemoteLoadingScreen = ({ title, message }: Props) => (
  <LoadingScreenContent testID="loader" contentTitle={title}>
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
