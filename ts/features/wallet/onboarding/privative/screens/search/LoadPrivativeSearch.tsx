import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { walletAddPrivativeCancel } from "../../store/actions";
import { onboardingSearchedPrivativeSelector } from "../../store/reducers/searchedPrivative";
import { onboardingPrivativeFoundIsError } from "../../store/reducers/foundPrivative";
import { useHardwareBackButton } from "../../../../../bonus/bonusVacanze/components/hooks/useHardwareBackButton";
import { LoadingErrorComponent } from "../../../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * Loading screen while search the privative card
 * @param props
 * @constructor
 */
const LoadPrivativeSearch = (props: Props): React.ReactElement => {
  useHardwareBackButton(() => {
    if (!props.isLoading) {
      props.cancel();
    }
    return true;
  });
  return (
    <LoadingErrorComponent
      {...props}
      loadingCaption={I18n.t("wallet.onboarding.coBadge.search.loading")}
      onAbort={props.cancel}
      onRetry={() => props.retry(props.abiSelected)}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddPrivativeCancel())
});

const mapStateToProps = (state: GlobalState) => ({
  privativeSelected: onboardingSearchedPrivativeSelector(state),
  isLoading: onboardingPrivativeFoundIsError(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoadPrivativeSearch);
