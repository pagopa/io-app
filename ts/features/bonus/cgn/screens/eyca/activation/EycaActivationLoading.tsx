import * as React from "react";
import { connect } from "react-redux";
import { GlobalState } from "../../../../../../store/reducers/types";
import { Dispatch } from "../../../../../../store/actions/types";
import { LoadingErrorComponent } from "../../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import I18n from "../../../../../../i18n";
import { cgnEycaActivationstatus } from "../../../store/reducers/eyca/activation";
import {
  cgnEycaActivationCancel,
  cgnEycaActivationRequest
} from "../../../store/actions/eyca/activation";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const EycaActivationLoading: React.FunctionComponent<Props> = (
  props: Props
) => (
  <LoadingErrorComponent
    isLoading={props.isLoading}
    onRetry={props.onRetry}
    loadingCaption={I18n.t("bonus.cgn.activation.eyca.loading.caption")}
    loadingSubtitle={I18n.t("bonus.cgn.activation.eyca.loading.subCaption")}
    errorText={I18n.t("bonus.cgn.activation.eyca.error.title")}
    errorSubText={I18n.t("bonus.cgn.activation.eyca.error.body")}
    onAbort={props.onCancel}
  />
);

const mapStateToProps = (state: GlobalState) => ({
  isLoading: cgnEycaActivationstatus(state) !== "ERROR"
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onRetry: () => dispatch(cgnEycaActivationRequest()),
  onCancel: () => dispatch(cgnEycaActivationCancel())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EycaActivationLoading);
