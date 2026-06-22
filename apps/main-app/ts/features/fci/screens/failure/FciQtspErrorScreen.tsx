import I18n from "i18next";
import {
  trackFciPollingFailureAction,
  trackFciPollingFailureScreenView
} from "../../analytics";
import FciErrorScreen from "../../components/FciErrorScreen";

const FciQtspErrorScreen = () => (
  <FciErrorScreen
    title={I18n.t("features.fci.qtspErrorPage.title")}
    subtitle={I18n.t("features.fci.qtspErrorPage.subtitle")}
    testID="FciQtspErrorTestID"
    onFirstRender={trackFciPollingFailureScreenView}
    onPressClose={() =>
      trackFciPollingFailureAction(
        "custom_1",
        I18n.t("features.fci.errors.buttons.close")
      )
    }
    onPressRetry={() =>
      trackFciPollingFailureAction(
        "custom_2",
        I18n.t("features.fci.errors.buttons.retry")
      )
    }
  />
);

export default FciQtspErrorScreen;
