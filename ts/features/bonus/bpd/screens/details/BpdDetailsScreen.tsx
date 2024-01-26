import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import DarkLayout from "../../../../../components/screens/DarkLayout";
import SectionStatusComponent from "../../../../../components/SectionStatus";
import I18n from "../../../../../i18n";
import { navigateBack } from "../../../../../store/actions/navigation";
import { GlobalState } from "../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { showToast } from "../../../../../utils/showToast";
import { useHardwareBackButton } from "../../../../../hooks/useHardwareBackButton";
import BpdLastUpdateComponent from "../../components/BpdLastUpdateComponent";
import {
  isError,
  isLoading,
  isReady
} from "../../../../../common/model/RemoteValue";
import { bpdAllData } from "../../store/actions/details";
import {
  bpdUnsubscribeCompleted,
  bpdUnsubscribeFailure
} from "../../store/actions/onboarding";
import { bpdUnsubscriptionSelector } from "../../store/reducers/details/activation";
import { bpdSelectedPeriodSelector } from "../../store/reducers/details/selectedPeriod";
import { bpdTransactionsForSelectedPeriod } from "../../store/reducers/details/transactions";
import BpdPeriodSelector from "./BpdPeriodSelector";
import BpdPeriodDetail from "./periods/BpdPeriodDetail";
import GoToTransactions from "./transaction/GoToTransactions";

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
  const {
    unsubscription,
    completeUnsubscriptionSuccess,
    completeUnsubscriptionFailure
  } = props;

  useEffect(() => {
    if (isError(unsubscription)) {
      showToast(I18n.t("bonus.bpd.unsubscribe.failure"), "danger");
      completeUnsubscriptionFailure();
    } else if (isReady(unsubscription)) {
      showToast(I18n.t("bonus.bpd.unsubscribe.success"), "success");
      completeUnsubscriptionSuccess();
    }
  }, [
    unsubscription,
    completeUnsubscriptionSuccess,
    completeUnsubscriptionFailure
  ]);

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
  const canRenderButton = pipe(
    props.selectedPeriod,
    O.fromNullable,
    O.fold(
      () => false,
      sp => {
        switch (sp.status) {
          case "Closed":
            return pipe(
              props.selectedPeriod?.amount?.transactionNumber,
              O.fromNullable,
              O.map(trx => trx > 0),
              O.getOrElse(() => false)
            );
          case "Inactive":
            return false;
          default:
            return true;
        }
      }
    )
  );
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
          canRenderButton ? (
            <GoToTransactions goToTransactions={props.goToTransactions} />
          ) : (
            // We need to render a footer element in order to have the right spacing when the device has the notch
            <View />
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
  completeUnsubscriptionSuccess: () => {
    dispatch(bpdAllData.request());
    dispatch(bpdUnsubscribeCompleted());
    navigateBack();
  },
  goToTransactions: () => null,
  goBack: () => navigateBack(),
  completeUnsubscriptionFailure: () => dispatch(bpdUnsubscribeFailure())
});

const mapStateToProps = (state: GlobalState) => ({
  unsubscription: bpdUnsubscriptionSelector(state),
  transactions: bpdTransactionsForSelectedPeriod(state),
  selectedPeriod: bpdSelectedPeriodSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(BpdDetailsScreen);
