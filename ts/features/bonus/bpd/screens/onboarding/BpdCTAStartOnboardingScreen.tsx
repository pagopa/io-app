import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { useEffect } from "react";
import { Alert } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import { bpdRemoteConfigSelector } from "../../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../../store/reducers/types";
import { useActionOnFocus } from "../../../../../utils/hooks/useOnFocus";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { loadAvailableBonuses } from "../../../bonusVacanze/store/actions/bonusVacanze";
import {
  isAvailableBonusErrorSelector,
  supportedAvailableBonusSelector
} from "../../../bonusVacanze/store/reducers/availableBonusesTypes";
import { bpdOnboardingStart } from "../../store/actions/onboarding";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;
const loadingCaption = () => I18n.t("global.remoteStates.loading");

const BaseBpdCTAStartOnboardingComponent = (props: Props) => {
  const { availableBonus, startBpd } = props;
  // load available bonus when component is focused
  useActionOnFocus(props.loadAvailableBonus);

  useEffect(() => {
    // bpdOnboardingStart navigate to ToS screen that needs availableBonus data
    if (availableBonus.length > 0) {
      startBpd();
    }
  }, [availableBonus, startBpd]);

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

/**
 * this is a dummy screen reachable only from a message CTA
 */
const BpdCTAStartOnboardingScreen: React.FC<Props> = (props: Props) => {
  const navigation = useNavigation();
  if (!props.bpdRemoteConfig?.program_active) {
    Alert.alert(
      I18n.t("bonus.bpd.title"),
      I18n.t("bonus.state.completed.description")
    );
    navigation.goBack();
    return null;
  } else {
    return <BaseBpdCTAStartOnboardingComponent {...props} />;
  }
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
