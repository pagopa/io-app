import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import { navigateBack } from "../../../../../store/actions/navigation";
import { GlobalState } from "../../../../../store/reducers/types";
import { useActionOnFocus } from "../../../../../utils/hooks/useOnFocus";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { loadAvailableBonuses } from "../../../bonusVacanze/store/actions/bonusVacanze";
import {
  availableBonusTypesSelectorFromId,
  isAvailableBonusErrorSelector,
  supportedAvailableBonusSelector
} from "../../../bonusVacanze/store/reducers/availableBonusesTypes";
import { ID_CGN_TYPE } from "../../../bonusVacanze/utils/bonus";
import { cgnActivationStart } from "../../store/actions/activation";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;
const loadingCaption = () => I18n.t("global.remoteStates.loading");

/**
 * this is a dummy screen reachable only from a message CTA
 */
const BpdCTAStartOnboardingScreen: React.FC<Props> = (props: Props) => {
  // load available bonus when component is focused
  useActionOnFocus(props.loadAvailableBonus);

  const { availableBonus, startCgn, cgnBonus } = props;

  React.useEffect(() => {
    // cgnActivationStart navigate to ToS screen that needs cgb bonus from available bonus list
    if (availableBonus.length > 0 && cgnBonus) {
      navigateBack();
      startCgn();
    }
  }, [availableBonus, startCgn, cgnBonus]);

  return (
    <BaseScreenComponent goBack={true} headerTitle={I18n.t("bonus.cgn.name")}>
      <LoadingErrorComponent
        isLoading={!props.hasError}
        loadingCaption={loadingCaption()}
        onRetry={props.loadAvailableBonus}
      />
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  startCgn: () => {
    dispatch(cgnActivationStart());
  },
  loadAvailableBonus: () => dispatch(loadAvailableBonuses.request())
});

const mapStateToProps = (globalState: GlobalState) => ({
  availableBonus: supportedAvailableBonusSelector(globalState),
  cgnBonus: availableBonusTypesSelectorFromId(ID_CGN_TYPE)(globalState),
  hasError: isAvailableBonusErrorSelector(globalState)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BpdCTAStartOnboardingScreen);
