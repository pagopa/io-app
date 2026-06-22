import I18n from "i18next";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../components/screens/OperationResultScreenContent";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import {
  fciEndRequest,
  fciSignatureRequestRetryFromId
} from "../store/actions";
import { fciSignatureRequestIdSelector } from "../store/reducers/fciSignatureRequest.ts";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender.ts";

type Props = {
  title: string;
  subtitle: string;
  testID: string;
  onFirstRender: () => void;
  onPressClose: () => void;
  onPressRetry: () => void;
  pictogram?: OperationResultScreenContentProps["pictogram"];
};

/**
 * Error screen for FCI flow errors with close and retry buttons.
 */
const FciErrorScreen = ({
  title,
  subtitle,
  testID,
  onFirstRender,
  onPressClose,
  onPressRetry,
  pictogram = "umbrella"
}: Props) => {
  const dispatch = useIODispatch();
  const signatureRequestId = useIOSelector(fciSignatureRequestIdSelector);

  useOnFirstRender(onFirstRender);

  const closeButtonProps = {
    testID: `${testID}CloseButton`,
    onPress: () => {
      onPressClose();
      dispatch(fciEndRequest());
    },
    label: I18n.t("features.fci.errors.buttons.close")
  };

  const operationResultActions = () => {
    if (signatureRequestId) {
      return {
        action: {
          testID: `${testID}RetryButton`,
          onPress: () => {
            onPressRetry();
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
      title={title}
      subtitle={subtitle}
      pictogram={pictogram}
      testID={testID}
      {...operationResultActions()}
    />
  );
};

export default FciErrorScreen;
