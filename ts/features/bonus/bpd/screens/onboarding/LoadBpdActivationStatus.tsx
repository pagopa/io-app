import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../store/reducers/types";
import { abortBonusRequest } from "../../../bonusVacanze/components/alert/AbortBonusRequest";
import { useHardwareBackButton } from "../../../bonusVacanze/components/hooks/useHardwareBackButton";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { isError } from "../../model/RemoteValue";
import {
  bpdOnboardingCancel,
  bpdOnboardingStart
} from "../../store/actions/onboarding";
import { bpdEnabledSelector } from "../../store/reducers/details/activation";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen is displayed when the user start the onboarding flow but the application does not know yet if the user
 * is already registered to the bpd service
 * @constructor
 */

const LoadBpdActivationStatus: React.FunctionComponent<Props> = props => {
  const loadingCaption = "Verifico lo stato di attivazione...";

  useHardwareBackButton(() => {
    if (!props.isLoading) {
      abortBonusRequest(props.onAbort);
    }
    return true;
  });

  return (
    <LoadingErrorComponent
      {...props}
      loadingCaption={loadingCaption}
      onAbort={() => abortBonusRequest(props.onAbort)}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onAbort: () => dispatch(bpdOnboardingCancel()),
  onRetry: () => {
    dispatch(bpdOnboardingStart());
  }
});

const mapStateToProps = (globalState: GlobalState) => ({
  // display the error with the retry only in case of networking errors
  isLoading: !isError(bpdEnabledSelector(globalState))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoadBpdActivationStatus);
