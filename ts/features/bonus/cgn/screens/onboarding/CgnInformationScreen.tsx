import * as React from "react";
import { connect } from "react-redux";
import I18n from "../../../../../i18n";
import { Dispatch } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { availableBonusTypesSelectorFromId } from "../../../bonusVacanze/store/reducers/availableBonusesTypes";
import { ID_CGN_TYPE } from "../../../bonusVacanze/utils/bonus";
import BonusInformationComponent from "../../../common/components/BonusInformationComponent";
import { cgnActivationCancel } from "../../store/actions/activation";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This Screen shows all the information about the cgn program, with the rules and t&c.
 */
const CgnInformationScreen: React.FunctionComponent<Props> = (props: Props) => {
  const onConfirm = () => props.userActivateCgn();

  return (
    <>
      {props.bonus ? (
        <BonusInformationComponent
          primaryCtaText={I18n.t("bonus.cgn.cta.activeBonus")}
          bonus={props.bonus}
          onConfirm={onConfirm}
          onCancel={props.onCancel}
          contextualHelp={emptyContextualHelp}
        />
      ) : null}
    </>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  // display the error with the retry only in case of networking errors
  bonus: availableBonusTypesSelectorFromId(ID_CGN_TYPE)(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  userActivateCgn: () => null,
  onCancel: () => dispatch(cgnActivationCancel())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CgnInformationScreen);
