import I18n from "i18next";
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
import { trackFciDocOpeningFailure } from "../../analytics";

const FciDocumentUnavailableScreen = () => {
  const dispatch = useIODispatch();
  const signatureRequestId = useIOSelector(fciSignatureRequestIdSelector);

  useOnFirstRender(() => {
    trackFciDocOpeningFailure();
  });

  const closeButtonProps = {
    testID: "FciCloseButtonTestID",
    onPress: () => dispatch(fciEndRequest()),
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
          onPress: () =>
            dispatch(fciSignatureRequestRetryFromId(signatureRequestId)),
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
