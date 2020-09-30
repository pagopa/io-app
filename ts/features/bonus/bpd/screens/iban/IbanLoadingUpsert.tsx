import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../store/reducers/types";
import { useHardwareBackButton } from "../../../bonusVacanze/components/hooks/useHardwareBackButton";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { bpdIbanInsertionCancel } from "../../store/actions/iban";
import { bpdOnboardingStart } from "../../store/actions/onboarding";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const IbanLoadingUpsert: React.FunctionComponent<Props> = props => {
  useHardwareBackButton(() => {
    if (!props.isLoading) {
      props.onAbort();
    }
    return true;
  });

  return (
    <LoadingErrorComponent
      {...props}
      loadingCaption={"asd loading..."}
      onAbort={props.onAbort}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onAbort: () => dispatch(bpdIbanInsertionCancel()),
  onRetry: () => {
    dispatch(bpdOnboardingStart());
  }
});

const mapStateToProps = (state: GlobalState) => ({
  isLoading: true
});

export default connect(mapStateToProps, mapDispatchToProps)(IbanLoadingUpsert);
