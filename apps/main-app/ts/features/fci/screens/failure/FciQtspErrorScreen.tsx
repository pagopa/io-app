import I18n from "i18next";
import {
  trackFciPollingFailureAction,
  trackFciPollingFailureScreenView
} from "../../analytics";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  fciEndRequest,
  fciSignatureRequestRetryFromId
} from "../../store/actions";
import { fciSignatureRequestIdSelector } from "../../store/reducers/fciSignatureRequest.ts";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender.ts";

const FciQtspErrorScreen = () => {
  const dispatch = useIODispatch();
  const signatureRequestId = useIOSelector(fciSignatureRequestIdSelector);

  useOnFirstRender(trackFciPollingFailureScreenView);

  const closeButtonProps = {
    testID: "FciQtspErrorTestIDCloseButton",
    onPress: () => {
      trackFciPollingFailureAction(
        "custom_1",
        I18n.t("features.fci.errors.buttons.close")
      );
      dispatch(fciEndRequest());
    },
    label: I18n.t("features.fci.errors.buttons.close")
  };

  const operationResultActions = () => {
    if (signatureRequestId) {
      return {
        action: {
          testID: "FciQtspErrorTestIDRetryButton",
          onPress: () => {
            trackFciPollingFailureAction(
              "custom_2",
              I18n.t("features.fci.errors.buttons.retry")
            );
            dispatch(fciSignatureRequestRetryFromId(signatureRequestId));
          },
          label: I18n.t("features.fci.errors.buttons.retry")
        },
        secondaryAction: closeButtonProps
      };
    }
    return { action: closeButtonProps };
  };

  return (
    <OperationResultScreenContent
      isHeaderVisible={false}
      title={I18n.t("features.fci.qtspErrorPage.title")}
      subtitle={I18n.t("features.fci.qtspErrorPage.subtitle")}
      pictogram="umbrella"
      testID="FciQtspErrorTestID"
      {...operationResultActions()}
    />
  );
};

export default FciQtspErrorScreen;
