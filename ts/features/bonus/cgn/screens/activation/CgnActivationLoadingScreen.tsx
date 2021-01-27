import * as React from "react";
import { connect } from "react-redux";
import { GlobalState } from "../../../../../store/reducers/types";
import { Dispatch } from "../../../../../store/actions/types";
import { isCgnActivationLoading } from "../../store/reducers/activation";
import {
  cgnActivationCancel,
  cgnRequestActivation
} from "../../store/actions/activation";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import I18n from "../../../../../i18n";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * Screen which is displayed when a user requested a CGN activation and we are waiting for the result from the backend
 */
const CgnActivationLoadingScreen = (props: Props): React.ReactElement => (
  <LoadingErrorComponent
    isLoading={props.isLoading}
    onRetry={props.onRetry}
    loadingCaption={I18n.t("bonus.cgn.activation.loading.caption")}
    loadingSubtitle={I18n.t("bonus.cgn.activation.loading.subCaption")}
    onAbort={props.onCancel}
  />
);

const mapStateToProps = (state: GlobalState) => ({
  isLoading: isCgnActivationLoading(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onRetry: () => dispatch(cgnRequestActivation.request()),
  onCancel: () => dispatch(cgnActivationCancel())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CgnActivationLoadingScreen);
