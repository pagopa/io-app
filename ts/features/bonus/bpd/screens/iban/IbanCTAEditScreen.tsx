import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { Alert } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import { navigateBack } from "../../../../../store/actions/navigation";
import { bpdRemoteConfigSelector } from "../../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../../store/reducers/types";
import { useActionOnFocus } from "../../../../../utils/hooks/useOnFocus";
import { isStrictSome } from "../../../../../utils/pot";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { navigateToBpdDetails } from "../../navigation/actions";
import { bpdAllData } from "../../store/actions/details";
import { bpdSelectPeriod } from "../../store/actions/selectedPeriod";
import { bpdEnabledSelector } from "../../store/reducers/details/activation";
import { bpdLastUpdateSelector } from "../../store/reducers/details/lastUpdate";
import {
  bpdPeriodsSelector,
  BpdPeriodWithInfo
} from "../../store/reducers/details/periods";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const loadLocales = () => ({
  loadingCaption: I18n.t("global.remoteStates.loading"),
  title: I18n.t("bonus.bpd.iban.verify"),
  alertNotActiveTitle: I18n.t("bonus.bpd.iban.cta.bpdNotActiveTitle"),
  alertNotActiveMessage: I18n.t("bonus.bpd.iban.cta.bpdNotActiveMessage"),
  alertNotPeriodActiveTitle: I18n.t("bonus.bpd.iban.cta.noActivePeriodTitle"),
  alertNotPeriodActiveMessage: I18n.t(
    "bonus.bpd.iban.cta.noActivePeriodMessage"
  )
});

const InnerIbanCTAEditScreen = (props: Props) => {
  useActionOnFocus(props.load);
  // keep track if loading has been completed or not
  // to avoid to handle not update data coming from the store
  const [isLoadingComplete, setLoadingComplete] =
    React.useState<boolean>(false);
  const { title, loadingCaption } = loadLocales();
  const {
    bpdLoadState,
    bpdEnabled,
    goBack,
    navigateToBPDPeriodDetails,
    bpdPeriods
  } = props;
  React.useEffect(() => {
    const {
      alertNotActiveTitle,
      alertNotActiveMessage,
      alertNotPeriodActiveTitle,
      alertNotPeriodActiveMessage
    } = loadLocales();
    if (!pot.isNone(bpdLoadState) && !pot.isNone(bpdEnabled)) {
      setLoadingComplete(true);
    }
    if (
      isLoadingComplete &&
      isStrictSome(bpdLoadState) &&
      pot.isSome(bpdEnabled)
    ) {
      // citizen not active to BPD
      if (!bpdEnabled.value) {
        Alert.alert(alertNotActiveTitle, alertNotActiveMessage, [
          {
            onPress: goBack
          }
        ]);
        return;
      }
      const activePeriod = pot
        .getOrElse(bpdPeriods, [])
        .find(p => p.status === "Active");
      if (activePeriod) {
        goBack();
        navigateToBPDPeriodDetails(activePeriod);
      }
      // no active period
      else {
        Alert.alert(alertNotPeriodActiveTitle, alertNotPeriodActiveMessage, [
          {
            onPress: goBack
          }
        ]);
      }
    }
  }, [
    bpdLoadState,
    bpdEnabled,
    isLoadingComplete,
    bpdPeriods,
    goBack,
    navigateToBPDPeriodDetails
  ]);

  const hasErrors = pot.isError(props.bpdLoadState);
  return (
    <BaseScreenComponent goBack={true} headerTitle={title}>
      <LoadingErrorComponent
        isLoading={!hasErrors}
        loadingCaption={loadingCaption}
        onRetry={props.load}
      />
    </BaseScreenComponent>
  );
};

/**
 * Landing screen from the CTA message that asks to review user's IBAN insertion
 */
const IbanCTAEditScreen: React.FC<Props> = (props: Props) => {
  const navigation = useNavigation();
  if (!props.bpdRemoteConfig?.program_active) {
    Alert.alert(
      I18n.t("bonus.bpd.title"),
      I18n.t("bonus.bpd.iban.bpdCompletedMessage")
    );
    navigation.goBack();
    return null;
  }
  return <InnerIbanCTAEditScreen {...props} />;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  load: () => {
    dispatch(bpdAllData.request());
  },
  goBack: () => navigateBack(),
  navigateToBPDPeriodDetails: (bpdPeriod: BpdPeriodWithInfo) => {
    dispatch(bpdSelectPeriod(bpdPeriod));
    navigateToBpdDetails(bpdPeriod);
  }
});

const mapStateToProps = (state: GlobalState) => ({
  bpdLoadState: bpdLastUpdateSelector(state),
  bpdPeriods: bpdPeriodsSelector(state),
  bpdEnabled: bpdEnabledSelector(state),
  bpdRemoteConfig: bpdRemoteConfigSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(IbanCTAEditScreen);
