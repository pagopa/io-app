import * as React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import * as pot from "italia-ts-commons/lib/pot";
import { bpdOnboardingStart } from "../../store/actions/onboarding";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import I18n from "../../../../../i18n";
import { loadAvailableBonuses } from "../../../bonusVacanze/store/actions/bonusVacanze";
import { GlobalState } from "../../../../../store/reducers/types";
import { availableBonusTypesSelector } from "../../../bonusVacanze/store/reducers/availableBonusesTypes";
import { useActionOnFocus } from "../../../../../utils/hooks/useOnFocus";
import { isStrictSome } from "../../../../../utils/pot";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;
const loadingCaption = () => I18n.t("global.remoteStates.loading");

/**
 * this is a dummy screen reachable only from a message CTA
 */
const BpdCTAStartOnboardingScreen: React.FC<Props> = (props: Props) => {
  const hasError = () => pot.isError(props.availableBonus);

  // load available bonus when component is focused
  useActionOnFocus(props.loadAvailableBonus);

  React.useEffect(() => {
    // bpdOnboardingStart navigate to ToS screen that needs availableBonus data
    if (isStrictSome(props.availableBonus)) {
      props.startBpd();
    }
  }, [props.availableBonus]);

  return (
    <BaseScreenComponent goBack={true} headerTitle={I18n.t("bonus.bpd.title")}>
      <LoadingErrorComponent
        isLoading={!hasError()}
        loadingCaption={loadingCaption()}
        onRetry={props.loadAvailableBonus}
      />
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  startBpd: () => {
    dispatch(bpdOnboardingStart());
  },
  loadAvailableBonus: () => dispatch(loadAvailableBonuses.request())
});

const mapStateToProps = (globalState: GlobalState) => ({
  availableBonus: availableBonusTypesSelector(globalState)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BpdCTAStartOnboardingScreen);
