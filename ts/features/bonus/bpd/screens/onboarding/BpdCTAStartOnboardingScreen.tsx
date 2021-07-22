import * as React from "react";
import { Alert } from "react-native";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { bpdRemoteConfigSelector } from "../../../../../store/reducers/backendStatus";
import { bpdOnboardingStart } from "../../store/actions/onboarding";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import I18n from "../../../../../i18n";
import { loadAvailableBonuses } from "../../../bonusVacanze/store/actions/bonusVacanze";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  isAvailableBonusErrorSelector,
  supportedAvailableBonusSelector
} from "../../../bonusVacanze/store/reducers/availableBonusesTypes";
import {
  useActionOnFocus,
  useNavigationContext
} from "../../../../../utils/hooks/useOnFocus";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;
const loadingCaption = () => I18n.t("global.remoteStates.loading");

/**
 * this is a dummy screen reachable only from a message CTA
 */
const BpdCTAStartOnboardingScreen: React.FC<Props> = (props: Props) => {
  const navigation = useNavigationContext();
  if (!props.bpdRemoteConfig?.program_active) {
    Alert.alert(
      I18n.t("bonus.bpd.title"),
      I18n.t("bonus.state.completed.description")
    );
    navigation.goBack();
    return null;
  }
  // load available bonus when component is focused
  useActionOnFocus(props.loadAvailableBonus);

  React.useEffect(() => {
    // bpdOnboardingStart navigate to ToS screen that needs availableBonus data
    if (props.availableBonus.length > 0) {
      props.startBpd();
    }
  }, [props.availableBonus]);

  return (
    <BaseScreenComponent goBack={true} headerTitle={I18n.t("bonus.bpd.title")}>
      <LoadingErrorComponent
        isLoading={!props.hasError}
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
  availableBonus: supportedAvailableBonusSelector(globalState),
  bpdRemoteConfig: bpdRemoteConfigSelector(globalState),
  hasError: isAvailableBonusErrorSelector(globalState)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BpdCTAStartOnboardingScreen);
