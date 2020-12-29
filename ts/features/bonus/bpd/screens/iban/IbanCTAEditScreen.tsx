import { Dispatch } from "redux";
import * as pot from "italia-ts-commons/lib/pot";
import { connect } from "react-redux";
import * as React from "react";
import { Alert } from "react-native";
import { GlobalState } from "../../../../../store/reducers/types";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { bpdLastUpdateSelector } from "../../store/reducers/details/lastUpdate";
import { bpdAllData } from "../../store/actions/details";
import { isStrictSome } from "../../../../../utils/pot";
import { availableBonusTypesSelector } from "../../../bonusVacanze/store/reducers/availableBonusesTypes";
import { bpdEnabledSelector } from "../../store/reducers/details/activation";
import { navigateBack } from "../../../../../store/actions/navigation";
import { navigateToBpdDetails } from "../../navigation/actions";
import {
  bpdPeriodsSelector,
  BpdPeriodWithInfo
} from "../../store/reducers/details/periods";
import { navigationHistoryPop } from "../../../../../store/actions/navigationHistory";
import { useActionOnFocus } from "../../../../../utils/hooks/useOnFocus";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;
const loadingCaption = () => I18n.t("global.remoteStates.loading");

/**
 * Landing screen from the CTA message that asks to review user's IBAN insertion
 */
const IbanCTAEditScreen: React.FC<Props> = (props: Props) => {
  useActionOnFocus(props.load);
  const [isLoadingComplete, setLoadingComplete] = React.useState<boolean>(
    false
  );
  React.useEffect(() => {
    if (!pot.isNone(props.bpdLoadState) && !pot.isNone(props.bpdEnabled)) {
      setLoadingComplete(true);
    }
    if (
      isLoadingComplete &&
      isStrictSome(props.bpdLoadState) &&
      pot.isSome(props.bpdEnabled)
    ) {
      // citizen not enrolled to BPD
      if (!props.bpdEnabled.value) {
        Alert.alert("title", "not enrolled", [
          {
            onPress: props.goBack
          }
        ]);
        return;
      }
      const activePeriod = pot
        .getOrElse(props.bpdPeriods, [])
        .find(p => p.status === "Active");
      if (activePeriod) {
        props.navigateToIbanInsertionStart(activePeriod);
      }
      // no active period
      else {
        Alert.alert("title", "not enrolled", [
          {
            onPress: props.goBack
          }
        ]);
      }

      // navigate to IBAN insertion screen
    }
  }, [props.bpdLoadState, props.bpdEnabled, isLoadingComplete]);

  const hasErrors = pot.isError(props.bpdLoadState);
  return (
    <BaseScreenComponent goBack={true} headerTitle={"TODO TITLE"}>
      <LoadingErrorComponent
        isLoading={!hasErrors}
        loadingCaption={loadingCaption()}
        onRetry={props.load}
      />
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  load: () => {
    dispatch(bpdAllData.request());
  },
  goBack: () => dispatch(navigateBack()),
  navigateToIbanInsertionStart: (bpdPeriod: BpdPeriodWithInfo) => {
    dispatch(navigateToBpdDetails(bpdPeriod));
    dispatch(navigationHistoryPop(1));
  }
});

const mapStateToProps = (state: GlobalState) => ({
  bpdLoadState: bpdLastUpdateSelector(state),
  availableBonus: availableBonusTypesSelector(state),
  bpdPeriods: bpdPeriodsSelector(state),
  bpdEnabled: bpdEnabledSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(IbanCTAEditScreen);
