import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { useHardwareBackButton } from "../../../bonusVacanze/components/hooks/useHardwareBackButton";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { isError } from "../../model/RemoteValue";
import {
  bpdOnboardingAcceptDeclaration,
  bpdOnboardingCancel
} from "../../store/actions/onboarding";
import { bpdEnrollSelector } from "../../store/reducers/onboarding/enroll";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen is displayed during the activation of the bpd
 */
const LoadActivateBpdScreen: React.FunctionComponent<Props> = props => {
  const loadingCaption =
    I18n.t("bonus.bpd.onboarding.loadingActivateBpd.title") +
    "\n" +
    I18n.t("bonus.bpd.onboarding.loadingActivateBpd.body");

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
    dispatch(bpdOnboardingAcceptDeclaration());
  }
});

const mapStateToProps = (globalState: GlobalState) => ({
  // display the error with the retry only in case of networking errors
  isLoading: !isError(bpdEnrollSelector(globalState))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoadActivateBpdScreen);
