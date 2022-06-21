import { useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import WorkunitGenericFailure from "../../../../../components/error/WorkunitGenericFailure";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { PayWebViewModal } from "../../../../../components/wallet/PayWebViewModal";
import {
  pagoPaApiUrlPrefix,
  pagoPaApiUrlPrefixTest
} from "../../../../../config";
import I18n from "../../../../../i18n";
import { isPagoPATestEnabledSelector } from "../../../../../store/reducers/persistedPreferences";
import { GlobalState } from "../../../../../store/reducers/types";
import { pmSessionTokenSelector } from "../../../../../store/reducers/wallet/payment";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { getLocalePrimaryWithFallback } from "../../../../../utils/locale";
import { getLookUpIdPO } from "../../../../../utils/pmLookUpId";
import { LoadingErrorComponent } from "../../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { fold } from "../../../../bonus/bpd/model/RemoteValue";
import {
  walletAddPaypalBack,
  walletAddPaypalOutcome,
  walletAddPaypalRefreshPMToken
} from "../store/actions";
import { navigateToPayPalCheckoutCompleted } from "../store/actions/navigation";
import { paypalOnboardingSelectedPsp } from "../store/reducers/selectedPsp";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const payUrlSuffix = "/v3/webview/paypal/onboarding/psp";
const webViewExitPathName = "/v3/webview/logout/bye";
const webViewOutcomeParamName = "outcome";

const LoadingOrError = (loadingProps: {
  hasError: boolean;
  onRetry: () => void;
}) => (
  <LoadingErrorComponent
    testID={"PayPalOnboardingCheckoutScreenLoadingError"}
    isLoading={!loadingProps.hasError}
    loadingCaption={I18n.t("global.remoteStates.loading")}
    onRetry={loadingProps.onRetry}
  />
);

const CheckoutContent = (
  props: Props & {
    onCheckoutCompleted: (outcode: O.Option<string>) => void;
    onGoBack: () => void;
  }
) => {
  const [isOnboardingCompleted, setIsOnboardingComplete] = useState(false);
  const urlPrefix = props.isPagoPATestEnabled
    ? pagoPaApiUrlPrefixTest
    : pagoPaApiUrlPrefix;
  return fold(
    props.pmToken,
    () => <LoadingOrError hasError={false} onRetry={props.refreshPMtoken} />,
    () => <LoadingOrError hasError={false} onRetry={props.refreshPMtoken} />,
    sessionToken => {
      // it should not never happen since this screen is just after the psp selection
      if (props.pspSelected === null) {
        return <WorkunitGenericFailure />;
      }
      // we have all we need to starts the checkout into the webview
      const formData = {
        idPsp: props.pspSelected.id,
        language: getLocalePrimaryWithFallback(),
        sessionToken,
        ...getLookUpIdPO()
      };
      return (
        <PayWebViewModal
          testID={"PayWebViewModalTestID"}
          showInfoHeader={false}
          postUri={urlPrefix + payUrlSuffix}
          formData={formData}
          isVisible={!isOnboardingCompleted}
          finishPathName={webViewExitPathName}
          onFinish={outcomeCode => {
            setIsOnboardingComplete(true);
            props.onCheckoutCompleted(outcomeCode);
          }}
          outcomeQueryparamName={webViewOutcomeParamName}
          onGoBack={props.onGoBack}
          modalHeaderTitle={I18n.t("wallet.onboarding.paypal.headerTitle")}
        />
      );
    },
    _ => <LoadingOrError hasError={true} onRetry={props.refreshPMtoken} />
  );
};

/**
 * This screen includes a webview where the paypal checkout happens. This flow is external to IO, it happens in the Payment Manager
 * As first step it asks for a fresh token from the Payment Manager, it will be included in the webview
 * 1. request for a fresh PM token
 * 2. when the PM token is obtained, starts the checkout challenge in the webview
 * 3. handle the outcome code coming from the step 2
 * 4. navigate to the checkout completed screen
 */
const PayPalOnboardingCheckoutScreen = (props: Props) => {
  const navigation = useNavigation();
  const { refreshPMtoken } = props;
  // refresh the PM at the startup
  useEffect(() => {
    refreshPMtoken();
  }, [refreshPMtoken]);

  const handleCheckoutCompleted = (outcomeCode: O.Option<string>) => {
    props.setOutcomeCode(outcomeCode);
    navigation.dispatch(navigateToPayPalCheckoutCompleted());
  };

  // notify the user that the current onboarding operation will be interrupted
  const handleBack = () => {
    Alert.alert(I18n.t("wallet.abortWebView.title"), "", [
      {
        text: I18n.t("wallet.abortWebView.confirm"),
        onPress: props.goBack,
        style: "cancel"
      },
      {
        text: I18n.t("wallet.abortWebView.cancel")
      }
    ]);
  };

  return (
    <BaseScreenComponent
      backButtonTestID={"host-back-button"}
      goBack={handleBack}
      headerTitle={I18n.t("wallet.onboarding.paypal.headerTitle")}
      contextualHelp={emptyContextualHelp}
    >
      <CheckoutContent
        {...props}
        onGoBack={handleBack}
        onCheckoutCompleted={handleCheckoutCompleted}
      />
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  goBack: () => dispatch(walletAddPaypalBack()),
  setOutcomeCode: (oc: O.Option<string>) =>
    dispatch(walletAddPaypalOutcome(oc)),
  refreshPMtoken: () => dispatch(walletAddPaypalRefreshPMToken.request())
});
const mapStateToProps = (state: GlobalState) => ({
  pmToken: pmSessionTokenSelector(state),
  isPagoPATestEnabled: isPagoPATestEnabledSelector(state),
  pspSelected: paypalOnboardingSelectedPsp(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PayPalOnboardingCheckoutScreen);
