import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { connect } from "react-redux";
import I18n from "../../../../../i18n";
import { Dispatch } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { actionWithAlert } from "../../../bonusVacanze/components/alert/ActionWithAlert";
import { availableBonusTypesSelectorFromId } from "../../../bonusVacanze/store/reducers/availableBonusesTypes";
import { ID_BPD_TYPE } from "../../../bonusVacanze/utils/bonus";
import BonusInformationComponent from "../../../common/components/BonusInformationComponent";
import {
  bpdOnboardingCancel,
  bpdUserActivate
} from "../../store/actions/onboarding";
import { bpdEnabledSelector } from "../../store/reducers/details/activation";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This Screen shows all the information about the bpd program, with the rules and t&c.
 */
const BpdInformationScreen: React.FunctionComponent<Props> = (props: Props) => {
  const onConfirm = () =>
    pot.getOrElse(props.bpdActiveBonus, false)
      ? actionWithAlert({
          title: I18n.t("bonus.bpd.onboarding.alert.title"),
          body: I18n.t("bonus.bpd.onboarding.alert.body"),
          cancelText: I18n.t("bonus.bpd.onboarding.alert.cancel"),
          confirmText: I18n.t("bonus.bpd.onboarding.alert.confirm"),
          onConfirmAction: props.onCancel
        })
      : props.userActivateBpd();

  return (
    <>
      {props.bonus ? (
        <BonusInformationComponent
          primaryCtaText={I18n.t("bonus.bpd.cta.activeBonus")}
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
  bonus: availableBonusTypesSelectorFromId(ID_BPD_TYPE)(state),
  bpdActiveBonus: bpdEnabledSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  userActivateBpd: () => dispatch(bpdUserActivate()),
  onCancel: () => dispatch(bpdOnboardingCancel())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BpdInformationScreen);
