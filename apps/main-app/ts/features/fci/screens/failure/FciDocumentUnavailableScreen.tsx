import I18n from "i18next";
import { RouteProp, useRoute } from "@react-navigation/native";
import {
  trackFciDocOpeningFailure,
  trackFciDocOpeningFailureAction
} from "../../analytics";
import FciErrorScreen from "../../components/FciErrorScreen";
import { FciParamsList } from "../../navigation/params";
import { FCI_ROUTES } from "../../navigation/routes";

const FciDocumentUnavailableScreen = () => {
  const route =
    useRoute<
      RouteProp<FciParamsList, typeof FCI_ROUTES.DOCUMENT_UNAVAILABLE>
    >();
  const errorKind =
    route.params?.errorKind === "expired" ? "expired" : "generic_error";

  return (
    <FciErrorScreen
      title={I18n.t("features.fci.documentUnavailablePage.title")}
      subtitle={I18n.t("features.fci.documentUnavailablePage.subtitle")}
      testID="FciDocUnavailableTestID"
      onFirstRender={() => trackFciDocOpeningFailure(errorKind)}
      onPressClose={() =>
        trackFciDocOpeningFailureAction(
          "custom_1",
          I18n.t("features.fci.errors.buttons.close"),
          errorKind
        )
      }
      onPressRetry={() =>
        trackFciDocOpeningFailureAction(
          "custom_2",
          I18n.t("features.fci.errors.buttons.retry"),
          errorKind
        )
      }
    />
  );
};

export default FciDocumentUnavailableScreen;
