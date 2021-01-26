import * as React from "react";
import { connect } from "react-redux";
import { GlobalState } from "../../../../../store/reducers/types";
import { Dispatch } from "../../../../../store/actions/types";
import { isCgnActivationLoading } from "../../store/reducers/activation";
import {
  cgnActivationCancel,
  cgnActivationStart
} from "../../store/actions/activation";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * Screen which is displayed when a user requested a CGN activation and we are waiting for the result from the backend
 */
const CgnActivationLoadingScreen = (props: Props): React.ReactElement => (
  <LoadingErrorComponent
    isLoading={props.isLoading}
    onRetry={props.onRetry}
    loadingCaption={"Activation loading"}
    onAbort={props.onCancel}
  />
);

const mapStateToProps = (state: GlobalState) => ({
  isLoading: isCgnActivationLoading(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onRetry: () => dispatch(cgnActivationStart()),
  onCancel: () => dispatch(cgnActivationCancel())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CgnActivationLoadingScreen);
