import { Body, ContentWrapper } from "@pagopa/io-app-design-system";
import { LoadingScreenContent } from "../../../../../components/screens/LoadingScreenContent";
import I18n from "../../../../../i18n";

type ItwProximityLoadingScreenProps = {
  title: string;
  message?: string;
};

export const ItwProximityLoadingScreen = ({
  title,
  message
}: ItwProximityLoadingScreenProps) => (
  <LoadingScreenContent testID="loader" contentTitle={title}>
    <ContentWrapper style={{ alignItems: "center" }}>
      <Body>
        {message ??
          I18n.t(
            "features.itWallet.presentation.proximity.loadingScreen.subtitle"
          )}
      </Body>
    </ContentWrapper>
  </LoadingScreenContent>
);
