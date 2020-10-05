import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { availableBonusTypesSelectorFromId } from "../../../bonusVacanze/store/reducers/availableBonusesTypes";
import { ID_BPD_TYPE } from "../../../bonusVacanze/utils/bonus";
import BonusInformationComponent from "../../../common/components/BonusInformationComponent";
import {
  bpdOnboardingCancel,
  bpdUserActivate
} from "../../store/actions/onboarding";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This Screen shows all the information about the bpd program, with the rules and t&c.
 */

const BpdInformationScreen: React.FunctionComponent<Props> = props => (
  <>
    {props.bonus.isSome() ? (
      <BonusInformationComponent
        bonus={props.bonus.value}
        onConfirm={props.userActivateBpd}
        onCancel={props.onCancel}
      />
    ) : null}
  </>
);

const mapStateToProps = (state: GlobalState) => ({
  // display the error with the retry only in case of networking errors
  bonus: availableBonusTypesSelectorFromId(ID_BPD_TYPE)(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  userActivateBpd: () => dispatch(bpdUserActivate()),
  onCancel: () => dispatch(bpdOnboardingCancel())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BpdInformationScreen);
