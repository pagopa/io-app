import i18n from "i18next";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";

export const SendAARLoadingComponent = () => (
  <LoadingScreenContent
    contentTitle={i18n.t("features.pn.aar.flow.fetchingQrData.loadingText")}
    testID="LoadingScreenContent"
  />
);
