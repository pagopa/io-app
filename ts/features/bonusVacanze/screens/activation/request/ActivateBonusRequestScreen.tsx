import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { shufflePinPadOnPayment } from "../../../../../config";
import I18n from "../../../../../i18n";
import { identificationRequest } from "../../../../../store/actions/identification";
import { GlobalState } from "../../../../../store/reducers/types";
import { abortBonusRequest } from "../../../components/AbortBonusRequest";
import { familyMembers } from "../../../mock/mockData";
import {
  bonusVacanzeActivation,
  cancelBonusEligibility
} from "../../../store/actions/bonusVacanze";
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
const ActivateBonusRequestScreen: React.FunctionComponent<Props> = props => {
  return (
    <ActivateBonusRequestComponent
      {...props}
      onRequestBonus={props.onActivateBonus}
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
        onSuccess: () => onIdentificationSuccess(dispatch)
      },
      shufflePinPadOnPayment
    )
  );
};

const onIdentificationSuccess = (dispatch: Dispatch) => {
  dispatch(bonusVacanzeActivation.request());
  // TODO: dispatch the start of the activation saga
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onCancel: () => abortBonusRequest(() => dispatch(cancelBonusEligibility())),
  // When the user choose to activate the bonus, verify the identification
  onActivateBonus: () => requestIdentification(dispatch)
});

const mapStateToProps = (state: GlobalState) => {
  const elc = eligibilityEligibleSelector(state);
  return {
    bonusAmount: elc.fold(500, e => e.dsu_request.max_amount),
    taxBenefit: elc.fold(100, e => e.dsu_request.max_tax_benefit),
    familyMembers: elc.fold(familyMembers, e => e.dsu_request.family_members),
    hasDiscrepancies: elc.fold(true, e => e.dsu_request.has_discrepancies)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActivateBonusRequestScreen);
