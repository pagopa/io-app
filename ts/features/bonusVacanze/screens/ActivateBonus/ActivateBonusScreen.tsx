import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { RTron } from "../../../../boot/configureStoreAndPersistor";
import { shufflePinPadOnPayment } from "../../../../config";
import I18n from "../../../../i18n";
import { identificationRequest } from "../../../../store/actions/identification";
import { GlobalState } from "../../../../store/reducers/types";
import { mockedElegibilityCheck } from "../../mock/mockData";
import { ActivateBonusComponent } from "./ActivateBonusComponent";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen allows the user to visualize the amount of the bonus available, the family composition, and offers two CTA:
 * - Cancel: Abort the bonus request
 * - Activate the bonus: Start the procedure to activate the bonus
 * The screen is tied to the business logic and is composed using {@link ActivateBonusComponent}
 * @param props
 * @constructor
 */
const ActivateBonusScreen: React.FunctionComponent<Props> = props => {
  return (
    <ActivateBonusComponent
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
        message: I18n.t("bonus.bonusVacanza.activateBonus.title")
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
  RTron.log("IdentificationSuccess");
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  // TODO: link with the right dispatch action
  onCancel: () => {
    RTron.log("CANCEL");
  },
  // When the user choose to activate the bonus, verify the identification
  onActivateBonus: () => requestIdentification(dispatch)
});

const mapStateToProps = (_: GlobalState) => ({
  // TODO: link with the right reducer
  bonusAmount: mockedElegibilityCheck.max_amount,
  taxBenefit: mockedElegibilityCheck.max_tax_benefit,
  // TODO: link with the right reducer
  familyMembers: mockedElegibilityCheck.family_members
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActivateBonusScreen);
