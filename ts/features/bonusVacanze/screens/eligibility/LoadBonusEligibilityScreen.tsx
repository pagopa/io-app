import { fromNullable } from "fp-ts/lib/Option";
import * as React from "react";
import { useEffect } from "react";
import { connect } from "react-redux";
import { Action, Dispatch } from "redux";
import I18n from "../../../../i18n";
import { GlobalState } from "../../../../store/reducers/types";
import { BaseLoadingErrorScreen } from "../../components/loadingErrorScreen/BaseLoadingErrorScreen";
import {
  navigateToActivateBonus,
  navigateToIseeNotAvailable,
  navigateToIseeNotEligible,
  navigateToTimeoutEligibilityCheck
} from "../../navigation/action";
import { checkBonusEligibility } from "../../store/actions/bonusVacanze";
import {
  eligibilityCheckRequestProgress,
  EligibilityRequestProgressEnum
} from "../../store/reducers/eligibility";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const loadingCaption = I18n.t("bonus.bonusVacanza.eligibility.loading");

const validResults = new Map([
  [EligibilityRequestProgressEnum.ELIGIBLE, navigateToActivateBonus],
  [EligibilityRequestProgressEnum.INELIGIBLE, navigateToIseeNotEligible],
  [EligibilityRequestProgressEnum.ISEE_NOT_FOUND, navigateToIseeNotAvailable],
  [EligibilityRequestProgressEnum.TIMEOUT, navigateToTimeoutEligibilityCheck]
]);

const handleEligibilityProgress = (props: Props) => {
  fromNullable(validResults.get(props.eligibilityOutcome)).map(
    nextNavigationAction => props.onNavigate(nextNavigationAction())
  );
};

/**
 * This screen is used during the check of the eligibility of the bonus.
 * This component link the generic {@link BaseLoadingErrorScreen} with the application flow using the {@link connect}
 * of redux.
 * @param props
 * @constructor
 */
const LoadBonusEligibilityScreen: React.FunctionComponent<Props> = props => {
  useEffect(() => {
    // TODO: remove from here, all the stack is loaded at the start
    props.checkEligibility();
  }, []);

  useEffect(
    () => {
      handleEligibilityProgress(props);
    },
    [props.eligibilityOutcome]
  );

  return (
    <BaseLoadingErrorScreen
      {...props}
      navigationTitle={loadingCaption}
      loadingCaption={loadingCaption}
      loadingOpacity={1}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  checkEligibility: () => dispatch(checkBonusEligibility.request()),
  // TODO: link with the right dispatch action, will dispatch the cancel request
  onCancel: () => undefined,
  onRetry: () => {
    dispatch(checkBonusEligibility.request());
  },
  onNavigate: (action: Action) => dispatch(action)
});

const mapStateToProps = (globalState: GlobalState) => ({
  // display the error with the retry only in case of networking errors
  isLoading: eligibilityCheckRequestProgress(globalState).fold(
    true,
    progress => progress !== EligibilityRequestProgressEnum.ERROR
  ),
  eligibilityOutcome: eligibilityCheckRequestProgress(globalState).getOrElse(
    EligibilityRequestProgressEnum.UNDEFINED
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoadBonusEligibilityScreen);
