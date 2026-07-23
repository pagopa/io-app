import I18n from "i18next";

import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender.ts";
import {
  trackFciPollingFailureAction,
  trackFciPollingFailureScreenView
} from "../../analytics";
import {
  fciEndRequest,
  fciSignatureRequestRetryFromId
} from "../../store/actions";
import { fciSignatureRequestIdSelector } from "../../store/reducers/fciSignatureRequest.ts";
import { fciQtspErrorKindSelector } from "../../store/selectors/fciErrors";

const FciQtspErrorScreen = () => {
  const dispatch = useIODispatch();
  const signatureRequestId = useIOSelector(fciSignatureRequestIdSelector);
  const errorKind = useIOSelector(fciQtspErrorKindSelector);

  useOnFirstRender(() => {
    trackFciPollingFailureScreenView(errorKind);
  });

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

  const operationResultActions = () => ({
    action: {
      testID: "FciQtspErrorTestIDRetryButton",
      onPress: () => {
        trackFciPollingFailureAction(
          "custom_2",
          I18n.t("features.fci.errors.buttons.retry")
        );
        // needed only for type checking
        if (signatureRequestId) {
          dispatch(fciSignatureRequestRetryFromId(signatureRequestId));
        }
      },
      label: I18n.t("features.fci.errors.buttons.retry")
    },
    secondaryAction: closeButtonProps
  });

  return (
    <OperationResultScreenContent
      isHeaderVisible={false}
      pictogram="umbrella"
      subtitle={I18n.t("features.fci.qtspErrorPage.subtitle")}
      testID="FciQtspErrorTestID"
      title={I18n.t("features.fci.qtspErrorPage.title")}
      {...operationResultActions()}
    />
  );
};

export default FciQtspErrorScreen;
