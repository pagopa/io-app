import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../../store/reducers/types";
import { abortBonusRequest } from "../../../components/alert/AbortBonusRequest";
import {
  activateBonusVacanze,
  cancelBonusVacanzeRequest
} from "../../../store/actions/bonusVacanze";
import { bonusVacanzeLogo } from "../../../store/reducers/availableBonusesTypes";
import { eligibilityEligibleSelector } from "../../../store/reducers/eligibility";
import { ActivateBonusRequestComponent } from "./ActivateBonusRequestComponent";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen allows the user to visualize the amount of the bonus available, the family composition, and offers two CTA:
 * - Cancel: Abort the bonus request
 * - Activate the bonus: Start the procedure to request the activation of the bonus
 * The screen is tied to the business logic and is composed using {@link ActivateBonusRequestComponent}
 * @param props
 * @constructor
 */
const ActivateBonusRequestScreen: React.FunctionComponent<Props> = props => (
  <ActivateBonusRequestComponent
    {...props}
    onRequestBonus={props.onActivateBonus}
  />
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onCancel: () =>
    abortBonusRequest(() => dispatch(cancelBonusVacanzeRequest())),
  // When the user choose to activate the bonus, verify the identification
  onActivateBonus: () => dispatch(activateBonusVacanze.request())
});

const mapStateToProps = (state: GlobalState) => {
  const elc = eligibilityEligibleSelector(state);
  return {
    bonusAmount: elc.fold(0, e => e.dsu_request.max_amount),
    taxBenefit: elc.fold(0, e => e.dsu_request.max_tax_benefit),
    familyMembers: elc.fold([], e => e.dsu_request.family_members),
    hasDiscrepancies: elc.fold(false, e => e.dsu_request.has_discrepancies),
    logo: bonusVacanzeLogo(state)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActivateBonusRequestScreen);
