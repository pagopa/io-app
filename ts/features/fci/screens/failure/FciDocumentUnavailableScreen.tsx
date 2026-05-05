import I18n from "i18next";
import { RouteProp, useRoute } from "@react-navigation/native";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  fciEndRequest,
  fciSignatureRequestRetryFromId
} from "../../store/actions";
import { fciSignatureRequestIdSelector } from "../../store/reducers/fciSignatureRequest.ts";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender.ts";
import {
  trackFciDocExpiredAction,
  trackFciDocExpiredFailure,
  trackFciDocOpeningFailure
} from "../../analytics";
import { FciParamsList } from "../../navigation/params";
import { FCI_ROUTES } from "../../navigation/routes";

const FciDocumentUnavailableScreen = () => {
  const dispatch = useIODispatch();
  const signatureRequestId = useIOSelector(fciSignatureRequestIdSelector);
  const route =
    useRoute<
      RouteProp<FciParamsList, typeof FCI_ROUTES.DOCUMENT_UNAVAILABLE>
    >();
  const errorKind = route.params?.errorKind;

  useOnFirstRender(() => {
    if (errorKind === "expired") {
      trackFciDocExpiredFailure();
    } else {
      trackFciDocOpeningFailure();
    }
  });

  const closeButtonProps = {
    testID: "FciCloseButtonTestID",
    onPress: () => {
      trackFciDocExpiredAction(
        "custom_1",
        I18n.t("features.fci.errors.buttons.close")
      );
      dispatch(fciEndRequest());
    },
    label: I18n.t("features.fci.errors.buttons.close")
  };

  type OperationResultButtons = Pick<
    OperationResultScreenContentProps,
    "action" | "secondaryAction"
  >;

  const operationResultActions = (): OperationResultButtons => {
    if (signatureRequestId) {
      return {
        action: {
          testID: "FciRetryButtonTestID",
          onPress: () => {
            trackFciDocExpiredAction(
              "custom_2",
              I18n.t("features.fci.errors.buttons.retry")
            );
            dispatch(fciSignatureRequestRetryFromId(signatureRequestId));
          },
          label: I18n.t("features.fci.errors.buttons.retry")
        },
        secondaryAction: closeButtonProps
      };
    } else {
      return {
        action: closeButtonProps
      };
    }
  };

  return (
    <OperationResultScreenContent
      isHeaderVisible={false}
      title={I18n.t("features.fci.documentUnavailablePage.title")}
      subtitle={I18n.t("features.fci.documentUnavailablePage.subtitle")}
      pictogram={"umbrella"}
      testID={"FciDocUnavailableTestID"}
      {...operationResultActions()}
    />
  );
};

export default FciDocumentUnavailableScreen;
