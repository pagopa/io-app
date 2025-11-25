import { FunctionComponent } from "react";
import { connect } from "react-redux";
import I18n from "i18next";
import { useHardwareBackButton } from "../../../../../hooks/useHardwareBackButton";
import { Dispatch } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../utils/help";
import BonusInformationComponent from "../../../common/components/BonusInformationComponent";
import { availableBonusTypesSelectorFromId } from "../../../common/store/selectors";
import { ID_CGN_TYPE } from "../../../common/utils";
import {
  cgnActivationBack,
  cgnActivationCancel,
  cgnRequestActivation
} from "../../store/actions/activation";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This Screen shows all the information about the cgn program, with the rules and t&c.
 */
const CgnInformationScreen: FunctionComponent<Props> = (props: Props) => {
  const onConfirm = () => props.userActivateCgn();
  useHardwareBackButton(() => {
    props.onBack();
    return true;
  });
  return (
    <>
      {props.bonus ? (
        <BonusInformationComponent
          onBack={props.onBack}
          primaryCtaText={I18n.t("bonus.cgn.cta.activeBonus")}
          secondaryAction={{ type: "back", text: I18n.t("bonus.cgn.cta.back") }}
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
  userActivateCgn: () => dispatch(cgnRequestActivation()),
  onBack: () => dispatch(cgnActivationBack()),
  onCancel: () => dispatch(cgnActivationCancel())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CgnInformationScreen);
