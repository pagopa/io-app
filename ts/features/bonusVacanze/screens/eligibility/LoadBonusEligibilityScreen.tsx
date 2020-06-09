import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../i18n";
import { GlobalState } from "../../../../store/reducers/types";
import { abortBonusRequest } from "../../components/AbortBonusRequest";
import { useHardwareBackButton } from "../../components/hooks/useHardwareBackButton";
import { LoadingErrorComponent } from "../../components/loadingErrorScreen/LoadingErrorComponent";
import {
  cancelBonusEligibility,
  checkBonusEligibility
} from "../../store/actions/bonusVacanze";
import { eligibilityIsLoading } from "../../store/reducers/eligibility";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen is used during the check of the eligibility of the bonus.
 * This component link the generic {@link BaseLoadingErrorScreen} with the application flow using the {@link connect}
 * of redux.
 * @param props
 * @constructor
 */
const LoadBonusEligibilityScreen: React.FunctionComponent<Props> = props => {
  const loadingCaption = I18n.t("bonus.bonusVacanza.eligibility.loading");

  useHardwareBackButton(() => {
    abortBonusRequest(props.onCancel);
    return true;
  });

  return (
    <LoadingErrorComponent
      {...props}
      loadingCaption={loadingCaption}
      loadingOpacity={1}
      onCancel={() => abortBonusRequest(props.onCancel)}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  // TODO: link with the right dispatch action, will dispatch the cancel request
  onCancel: () => dispatch(cancelBonusEligibility()),
  onRetry: () => {
    dispatch(checkBonusEligibility.request());
  }
});

const mapStateToProps = (globalState: GlobalState) => ({
  // display the error with the retry only in case of networking errors
  isLoading: eligibilityIsLoading(globalState)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoadBonusEligibilityScreen);
