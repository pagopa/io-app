import { FunctionComponent } from "react";
import { connect } from "react-redux";
import { isError, isLoading } from "../../../../../../common/model/RemoteValue";
import { OperationResultScreenContent } from "../../../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../../../i18n";
import { Dispatch } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import LoadingComponent from "../../../../../fci/components/LoadingComponent";
import {
  cgnEycaActivation,
  cgnEycaActivationCancel
} from "../../../store/actions/eyca/activation";
import { eycaActivationStatusSelector } from "../../../store/reducers/eyca/activation";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const EycaActivationLoading: FunctionComponent<Props> = (props: Props) =>
  props.isLoading ? (
    <LoadingComponent
      captionTitle={I18n.t("bonus.cgn.activation.eyca.loading.caption")}
      captionSubtitle={I18n.t("bonus.cgn.activation.eyca.loading.subCaption")}
      testID="eyca-activation-loading"
    />
  ) : (
    <OperationResultScreenContent
      testID="eyca-activation-error"
      pictogram="umbrella"
      enableAnimatedPictogram
      title={I18n.t("bonus.cgn.activation.eyca.error.title")}
      subtitle={I18n.t("bonus.cgn.activation.eyca.error.body")}
      action={{
        label: I18n.t("global.buttons.retry"),
        onPress: props.onRetry,
        testID: "eyca-activation-retry-button"
      }}
      secondaryAction={{
        label: I18n.t("global.buttons.cancel"),
        onPress: props.onCancel,
        testID: "eyca-activation-cancel-button"
      }}
    />
  );

const mapStateToProps = (state: GlobalState) => {
  const eycaActivation = eycaActivationStatusSelector(state);
  return {
    isLoading: isLoading(eycaActivation) || !isError(eycaActivation)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onRetry: () => dispatch(cgnEycaActivation.request()),
  onCancel: () => dispatch(cgnEycaActivationCancel())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EycaActivationLoading);
