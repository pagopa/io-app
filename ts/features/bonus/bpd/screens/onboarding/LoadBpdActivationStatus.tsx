import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../store/reducers/types";
import { abortBonusRequest } from "../../../bonusVacanze/components/alert/AbortBonusRequest";
import { useHardwareBackButton } from "../../../bonusVacanze/components/hooks/useHardwareBackButton";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { isError } from "../../model/RemoteValue";
import {
  BpdOnboardingCancel,
  BpdOnboardingStart
} from "../../store/actions/onboarding";
import { bpdActiveSelector } from "../../store/reducers/details";

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
  onAbort: () => dispatch(BpdOnboardingCancel()),
  onRetry: () => {
    dispatch(BpdOnboardingStart());
  }
});

const mapStateToProps = (globalState: GlobalState) => ({
  // display the error with the retry only in case of networking errors
  isLoading: !isError(bpdActiveSelector(globalState))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoadBpdActivationStatus);
