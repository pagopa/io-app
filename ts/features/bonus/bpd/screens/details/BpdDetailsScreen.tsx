import { useEffect } from "react";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { NavigationActions } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import DarkLayout from "../../../../../components/screens/DarkLayout";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { showToast } from "../../../../../utils/showToast";
import { isError, isLoading, isReady } from "../../model/RemoteValue";
import { bpdDetailsLoadAll } from "../../store/actions/details";
import { bpdUnsubscribeCompleted } from "../../store/actions/onboarding";
import { bpdUnsubscriptionSelector } from "../../store/reducers/details/activation";
import { bpdTransactionsForSelectedPeriod } from "../../store/reducers/details/transactions";
import { bpdSelectedPeriodSelector } from "../../store/reducers/details/selectedPeriod";
import { navigateToBpdTransactions } from "../../navigation/actions";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { useHardwareBackButton } from "../../../bonusVacanze/components/hooks/useHardwareBackButton";
import { navigateBack } from "../../../../../store/actions/navigation";
import SectionStatusComponent from "../../../../../components/SectionStatusComponent";
import BpdPeriodSelector from "./BpdPeriodSelector";
import BpdPeriodDetail from "./periods/BpdPeriodDetail";
import GoToTransactions from "./transaction/GoToTransactions";
import reactotron from "reactotron-react-native";
import BpdLastUpdateComponent from "../../components/BpdLastUpdateComponent";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  headerSpacer: {
    height: 172
  },
  selector: {
    // TODO: temp, as placeholder from invision, waiting for the components
    height: 192 + 10 + 16 + 16,
    width: "100%",
    position: "absolute",
    top: 16,
    zIndex: 7,
    elevation: 7
  },
  selectorSpacer: {
    height: 60
  }
});

/**
 * The screen that allows the user to see all the details related to the bpd.
 * @constructor
 */
const BpdDetailsScreen: React.FunctionComponent<Props> = props => {
  const loading = isLoading(props.unsubscription);

  useEffect(() => {
    if (isError(props.unsubscription)) {
      showToast(I18n.t("bonus.bpd.unsubscribe.failure"), "danger");
    } else if (isReady(props.unsubscription)) {
      showToast(I18n.t("bonus.bpd.unsubscribe.success"), "success");
      props.completeUnsubscription();
    }
  }, [props.unsubscription]);

  useHardwareBackButton(() => {
    props.goBack();
    return true;
  });

  /**
   * Display the transactions button when:
   * - Period is closed and transactions number is > 0
   * - Period is active
   * never displays for inactive/incoming period
   */
  const canRenderButton = fromNullable(props.selectedPeriod).fold(false, sp => {
    switch (sp.status) {
      case "Closed":
        return pot.getOrElse(
          pot.map(props.transactions, val => val.length > 0),
          false
        );
      case "Inactive":
        return false;
      default:
        return true;
    }
  });
  return (
    <LoadingSpinnerOverlay
      isLoading={loading}
      loadingCaption={I18n.t("bonus.bpd.unsubscribe.loading")}
      loadingOpacity={0.95}
    >
      <DarkLayout
        bounces={false}
        title={I18n.t("bonus.bpd.name")}
        allowGoBack={true}
        topContent={<View style={styles.headerSpacer} />}
        gradientHeader={true}
        hideHeader={true}
        contextualHelp={emptyContextualHelp}
        footerContent={
          canRenderButton && (
            <GoToTransactions goToTransactions={props.goToTransactions} />
          )
        }
        footerFullWidth={<SectionStatusComponent sectionKey={"cashback"} />}
      >
        <View style={styles.selector}>
          <BpdPeriodSelector />
        </View>
        <View style={styles.selectorSpacer} />
        <BpdLastUpdateComponent />
        <BpdPeriodDetail />
      </DarkLayout>
    </LoadingSpinnerOverlay>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  load: () => dispatch(bpdDetailsLoadAll()),
  completeUnsubscription: () => {
    dispatch(bpdDetailsLoadAll());
    dispatch(bpdUnsubscribeCompleted());
    dispatch(NavigationActions.back());
  },
  goToTransactions: () => dispatch(navigateToBpdTransactions()),
  goBack: () => dispatch(navigateBack())
});

const mapStateToProps = (state: GlobalState) => ({
  unsubscription: bpdUnsubscriptionSelector(state),
  transactions: bpdTransactionsForSelectedPeriod(state),
  selectedPeriod: bpdSelectedPeriodSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(BpdDetailsScreen);
