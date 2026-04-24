import I18n from "i18next";
import { FunctionComponent, useCallback } from "react";
import { isError, isLoading } from "../../../../../../common/model/RemoteValue";
import LoadingScreenContent from "../../../../../../components/screens/LoadingScreenContent";
import { OperationResultScreenContent } from "../../../../../../components/screens/OperationResultScreenContent";
import { useIODispatch, useIOSelector } from "../../../../../../store/hooks";
import {
  cgnEycaActivation,
  cgnEycaActivationCancel
} from "../../../store/actions/eyca/activation";
import { eycaActivationStatusSelector } from "../../../store/reducers/eyca/activation";

const EycaActivationLoading: FunctionComponent = () => {
  const dispatch = useIODispatch();
  const eycaActivation = useIOSelector(eycaActivationStatusSelector);
  const isLoadingState = isLoading(eycaActivation) || !isError(eycaActivation);

  const onRetry = useCallback(() => {
    dispatch(cgnEycaActivation.request());
  }, [dispatch]);

  const onCancel = useCallback(() => {
    dispatch(cgnEycaActivationCancel());
  }, [dispatch]);

  return isLoadingState ? (
    <LoadingScreenContent
      title={I18n.t("bonus.cgn.activation.eyca.loading.caption")}
      subtitle={I18n.t("bonus.cgn.activation.eyca.loading.subCaption")}
      testID="eyca-activation-loading"
    />
  ) : (
    <OperationResultScreenContent
      testID="eyca-activation-error"
      pictogram="umbrella"
      title={I18n.t("bonus.cgn.activation.eyca.error.title")}
      subtitle={I18n.t("bonus.cgn.activation.eyca.error.body")}
      action={{
        label: I18n.t("global.buttons.retry"),
        onPress: onRetry,
        testID: "eyca-activation-retry-button"
      }}
      secondaryAction={{
        label: I18n.t("global.buttons.cancel"),
        onPress: onCancel,
        testID: "eyca-activation-cancel-button"
      }}
    />
  );
};

export default EycaActivationLoading;
