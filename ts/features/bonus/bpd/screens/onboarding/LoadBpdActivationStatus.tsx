import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { useHardwareBackButton } from "../../../../../hooks/useHardwareBackButton";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
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
  const loadingCaption = I18n.t(
    "bonus.bpd.onboarding.loadingActivationStatus.title"
  );

  useHardwareBackButton(() => {
    if (!props.isLoading) {
      props.onAbort();
    }
    return true;
  });

  return (
    <LoadingErrorComponent
      {...props}
      loadingCaption={loadingCaption}
      onAbort={props.onAbort}
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
  isLoading: !pot.isError(bpdEnabledSelector(globalState))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoadBpdActivationStatus);
