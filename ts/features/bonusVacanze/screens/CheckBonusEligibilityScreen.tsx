import { fromNullable } from "fp-ts/lib/Option";
import * as React from "react";
import { useEffect } from "react";
import { connect } from "react-redux";
import { Action, Dispatch } from "redux";
import { RTron } from "../../../boot/configureStoreAndPersistor";
import I18n from "../../../i18n";
import { GlobalState } from "../../../store/reducers/types";
import { BaseLoadingErrorScreen } from "../components/loadingErrorScreen/BaseLoadingErrorScreen";
import {
  navigateToActivateBonus,
  navigateToIseeNotAvailable,
  navigateToIseeNotEligible
} from "../navigation/action";
import { checkBonusEligibility } from "../store/actions/bonusVacanze";
import {
  eligibilityCheckRequestProgress,
  eligibilityOutcome,
  EligibilityOutcome,
  EligibilityRequestProgressEnum
} from "../store/reducers/bonusVacanze";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const loadingCaption = I18n.t(
  "bonus.bonusVacanza.checkBonusEligibility.loading"
);

const validResults = new Map([
  [EligibilityOutcome.ELIGIBLE, navigateToActivateBonus],
  [EligibilityOutcome.INELIGIBLE, navigateToIseeNotEligible],
  [EligibilityOutcome.ISEE_NOT_FOUND, navigateToIseeNotAvailable]
]);

const handleEligibilityProgress = (props: Props) => {
  RTron.log("change OUTCOME", props.eligibilityOutcome);
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
const CheckBonusEligibilityScreen: React.FunctionComponent<Props> = props => {
  useEffect(() => {
    RTron.log("mount");
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
  onCancel: () => {
    RTron.log("CANCEL");
  },
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
  eligibilityOutcome: eligibilityOutcome(globalState)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CheckBonusEligibilityScreen);
