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
      subtitle={I18n.t("bonus.cgn.activation.eyca.loading.subCaption")}
      testID="eyca-activation-loading"
      title={I18n.t("bonus.cgn.activation.eyca.loading.caption")}
    />
  ) : (
    <OperationResultScreenContent
      action={{
        label: I18n.t("global.buttons.retry"),
        onPress: onRetry,
        testID: "eyca-activation-retry-button"
      }}
      pictogram="umbrella"
      secondaryAction={{
        label: I18n.t("global.buttons.cancel"),
        onPress: onCancel,
        testID: "eyca-activation-cancel-button"
      }}
      subtitle={I18n.t("bonus.cgn.activation.eyca.error.body")}
      testID="eyca-activation-error"
      title={I18n.t("bonus.cgn.activation.eyca.error.title")}
    />
  );
};

export default EycaActivationLoading;
