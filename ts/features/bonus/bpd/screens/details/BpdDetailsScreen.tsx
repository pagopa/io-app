import { useEffect } from "react";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { NavigationActions } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import DarkLayout from "../../../../../components/screens/DarkLayout";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { showToast } from "../../../../../utils/showToast";
import { isError, isLoading, isReady } from "../../model/RemoteValue";
import { bpdDetailsLoadAll } from "../../store/actions/details";
import { bpdUnsubscribeCompleted } from "../../store/actions/onboarding";
import { bpdUnsubscriptionSelector } from "../../store/reducers/details/activation";
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

  useEffect(() => {
    if (isError(props.unsubscription)) {
      showToast(I18n.t("bonus.bpd.unsubscribe.failure"), "danger");
    }
    if (isReady(props.unsubscription)) {
      showToast(I18n.t("bonus.bpd.unsubscribe.success"), "success");
      props.completeUnsubscription();
    }
  }, [props.unsubscription]);

  return (
    <LoadingSpinnerOverlay
      isLoading={loading}
      loadingCaption={I18n.t("bonus.bpd.unsubscribe.loading")}
      loadingOpacity={0.95}
      onCancel={undefined}
    >
      <DarkLayout
        bounces={false}
        title={I18n.t("bonus.bpd.name")}
        faqCategories={["bonus_detail"]}
        allowGoBack={true}
        topContent={<View style={styles.headerSpacer} />}
        gradientHeader={true}
        hideHeader={true}
        footerContent={<GoToTransactions />}
      >
        <View style={styles.selector}>
          <BpdPeriodSelector />
        </View>
        <View style={styles.selectorSpacer} />
        <BpdPeriodDetail />
      </DarkLayout>
    </LoadingSpinnerOverlay>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  load: () => dispatch(bpdDetailsLoadAll()),
  completeUnsubscription: () => {
    dispatch(bpdUnsubscribeCompleted());
    dispatch(NavigationActions.back());
  }
});

const mapStateToProps = (state: GlobalState) => ({
  unsubscription: bpdUnsubscriptionSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(BpdDetailsScreen);
