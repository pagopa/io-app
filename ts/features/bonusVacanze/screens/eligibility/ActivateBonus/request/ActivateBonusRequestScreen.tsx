import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { MaxBonusAmount } from "../../../../../../../definitions/bonus_vacanze/MaxBonusAmount";
import { MaxBonusTaxBenefit } from "../../../../../../../definitions/bonus_vacanze/MaxBonusTaxBenefit";
import { shufflePinPadOnPayment } from "../../../../../../config";
import I18n from "../../../../../../i18n";
import { identificationRequest } from "../../../../../../store/actions/identification";
import { GlobalState } from "../../../../../../store/reducers/types";
import { eligibilityCheckResults } from "../../../../store/reducers/eligibility";
import { eligibilityEligibleSelector } from "../../../../store/reducers/eligibility";
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
const ActivateBonusRequestScreen: React.FunctionComponent<Props> = props => {
  return (
    <ActivateBonusRequestComponent
      onCancel={props.onCancel}
      onRequestBonus={props.onActivateBonus}
      bonusAmount={props.bonusAmount}
      taxBenefit={props.taxBenefit}
      familyMembers={props.familyMembers}
    />
  );
};

/**
 * Verify the identification using pin / biometric
 * @param dispatch
 */
const requestIdentification = (dispatch: Dispatch) => {
  dispatch(
    identificationRequest(
      false,
      true,
      {
        message: I18n.t("bonus.bonusVacanza.eligibility.activateBonus.title")
      },
      {
        label: I18n.t("global.buttons.cancel"),
        onCancel: () => undefined
      },
      {
        onSuccess: onIdentificationSuccess
      },
      shufflePinPadOnPayment
    )
  );
};

const onIdentificationSuccess = () => {
  // TODO: link with the business logic that dispatch the activation to backend
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  // TODO: link with the right dispatch action
  onCancel: () => undefined,
  // When the user choose to activate the bonus, verify the identification
  onActivateBonus: () => requestIdentification(dispatch)
});

const mapStateToProps = (state: GlobalState) => {
  const elc = eligibilityEligibleSelector(state);
  return {
    bonusAmount: elc.fold(0 as MaxBonusAmount, e => e.max_amount),
    taxBenefit: elc.fold(0 as MaxBonusTaxBenefit, e => e.max_tax_benefit),
    familyMembers: elc.fold([], e => e.family_members)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActivateBonusRequestScreen);
