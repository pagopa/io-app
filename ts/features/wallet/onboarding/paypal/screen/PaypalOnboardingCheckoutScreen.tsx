import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import {
  walletAddPaypalBack,
  walletAddPaypalCancel,
  walletAddPaypalRefreshPMToken
} from "../store/actions";
import { GlobalState } from "../../../../../store/reducers/types";
import { pmSessionTokenSelector } from "../../../../../store/reducers/wallet/payment";
import { fold } from "../../../../bonus/bpd/model/RemoteValue";
import { LoadingErrorComponent } from "../../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { PayWebViewModal } from "../../../../../components/wallet/PayWebViewModal";
import {
  pagoPaApiUrlPrefix,
  pagoPaApiUrlPrefixTest
} from "../../../../../config";
import { isPagoPATestEnabledSelector } from "../../../../../store/reducers/persistedPreferences";
import { paypalOnboardingSelectedPsp } from "../store/reducers/selectedPsp";
import { getLocalePrimaryWithFallback } from "../../../../../utils/locale";
import { getLookUpIdPO } from "../../../../../utils/pmLookUpId";
import { constNull } from "fp-ts/es6/function";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const payUrlSuffix = "/v3/webview/paypal/onboarding/psp";
const webViewExitPathName = "/v3/webview/logout/bye";
const webViewOutcomeParamName = "outcome";

const getScreenContent = (props: Props) => {
  const LoadingOrError = (loadingProps: { hasError: boolean }) => (
    <LoadingErrorComponent
      testID={"PayPalPpsSelectionScreenLoadingError"}
      isLoading={!loadingProps.hasError}
      loadingCaption={I18n.t("global.remoteStates.loading")}
      onRetry={props.refreshPMtoken}
    />
  );
  const urlPrefix = props.isPagoPATestEnabled
    ? pagoPaApiUrlPrefixTest
    : pagoPaApiUrlPrefix;
  return fold(
    props.pmToken,
    () => <LoadingOrError hasError={true} />,
    () => <LoadingOrError hasError={false} />,
    sessionToken => {
      // it should not never happen since this screen is just before the psp selection
      if (props.pspSelected === null) {
        return <LoadingOrError hasError={true} />;
      }
      const formData = {
        idPsp: props.pspSelected.id,
        language: getLocalePrimaryWithFallback(),
        sessionToken,
        ...getLookUpIdPO()
      };
      return (
        <PayWebViewModal
          postUri={urlPrefix + payUrlSuffix}
          formData={formData}
          finishPathName={webViewExitPathName}
          onFinish={constNull}
          outcomeQueryparamName={webViewOutcomeParamName}
          onGoBack={constNull}
          modalHeaderTitle={I18n.t("wallet.challenge3ds.header")}
        />
      );
    },
    _ => <LoadingOrError hasError={true} />
  );
};

/**
 * This screen includes a webview where the paypal onboarding happens. It is external to IO
 * As first step it asks for a fresh token to the Payment Manager, it will be included in the webview
 */
const PaypalOnboardingCheckoutScreen = (props: Props) => {
  const { refreshPMtoken } = props;
  useEffect(() => {
    refreshPMtoken();
  }, [refreshPMtoken]);
  return (
    <BaseScreenComponent
      goBack={props.goBack}
      headerTitle={I18n.t("wallet.onboarding.paypal.headerTitle")}
      contextualHelp={emptyContextualHelp}
      faqCategories={["payment"]}
    >
      {getScreenContent(props)}
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  goBack: () => dispatch(walletAddPaypalBack()),
  cancel: () => dispatch(walletAddPaypalCancel()),
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
)(PaypalOnboardingCheckoutScreen);
