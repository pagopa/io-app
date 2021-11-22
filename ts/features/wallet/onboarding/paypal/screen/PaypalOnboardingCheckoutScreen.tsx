import React, { useContext, useEffect, useState } from "react";
import * as pot from "italia-ts-commons/lib/pot";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Option } from "fp-ts/lib/Option";
import { NavigationContext } from "react-navigation";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import {
  walletAddPaypaOutcome,
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
import { isPaymentOutcomeCodeSuccessfully } from "../../../../../utils/payment";
import { outcomeCodesSelector } from "../../../../../store/reducers/wallet/outcomeCode";
import { navigateToPayPalCheckoutSuccess } from "../store/actions/navigation";
import { fetchWalletsRequestWithExpBackoff } from "../../../../../store/actions/wallet/wallets";
import { paypalSelector } from "../../../../../store/reducers/wallet/wallets";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const payUrlSuffix = "/v3/webview/paypal/onboarding/psp";
const webViewExitPathName = "/v3/webview/logout/bye";
const webViewOutcomeParamName = "outcome";

const CheckoutContent = (
  props: Props & {
    onCheckoutSuccess: (outcode: Option<string>) => void;
    onCheckoutFailure: (outcode: Option<string>) => void;
  }
) => {
  const handleCheckoutOutcome = (maybeOutcomeCode: Option<string>) => {
    // the outcome code is successfully
    if (
      maybeOutcomeCode.isSome() &&
      isPaymentOutcomeCodeSuccessfully(
        maybeOutcomeCode.value,
        props.outcomeCodes
      )
    ) {
      props.onCheckoutSuccess(maybeOutcomeCode);
      return;
    }
    props.onCheckoutFailure(maybeOutcomeCode);
  };

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
          showInfoHeader={false}
          postUri={urlPrefix + payUrlSuffix}
          formData={formData}
          finishPathName={webViewExitPathName}
          onFinish={handleCheckoutOutcome}
          outcomeQueryparamName={webViewOutcomeParamName}
          onGoBack={props.goBack}
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
  const [checkoutComplete, setCheckoutCompleted] = useState(false);
  const navigation = useContext(NavigationContext);
  const { refreshPMtoken } = props;
  useEffect(() => {
    refreshPMtoken();
  }, [refreshPMtoken]);
  useEffect(() => {
    // paypal has been added to the user wallet, go to the success screen
    if (pot.isSome(props.paypalPaymentMethod)) {
      navigation.dispatch(navigateToPayPalCheckoutSuccess());
    }
  }, [navigation, props.paypalPaymentMethod]);
  const handleCheckoutComplete = (outcomeCode: Option<string>) => {
    setCheckoutCompleted(true);
    props.setOutcomeCode(outcomeCode);
  };
  return (
    <BaseScreenComponent
      goBack={props.goBack}
      headerTitle={I18n.t("wallet.onboarding.paypal.headerTitle")}
      contextualHelp={emptyContextualHelp}
      faqCategories={["payment"]}
    >
      {!checkoutComplete ? (
        <CheckoutContent
          {...props}
          onCheckoutSuccess={outcomeCode => {
            props.loadWallets();
            handleCheckoutComplete(outcomeCode);
          }}
          onCheckoutFailure={outcomeCode => {
            handleCheckoutComplete(outcomeCode);
          }}
        />
      ) : (
        // the checkout is completed handle load wallets failures
        <LoadingErrorComponent
          isLoading={!pot.isError(props.paypalPaymentMethod)}
          loadingCaption={I18n.t("global.remoteStates.loading")}
          onRetry={props.loadWallets}
        />
      )}
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  goBack: () => dispatch(walletAddPaypalBack()),
  cancel: () => dispatch(walletAddPaypalCancel()),
  setOutcomeCode: (oc: Option<string>) => dispatch(walletAddPaypaOutcome(oc)),
  refreshPMtoken: () => dispatch(walletAddPaypalRefreshPMToken.request()),
  loadWallets: () => dispatch(fetchWalletsRequestWithExpBackoff())
});
const mapStateToProps = (state: GlobalState) => ({
  pmToken: pmSessionTokenSelector(state),
  isPagoPATestEnabled: isPagoPATestEnabledSelector(state),
  pspSelected: paypalOnboardingSelectedPsp(state),
  outcomeCodes: outcomeCodesSelector(state),
  paypalPaymentMethod: paypalSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaypalOnboardingCheckoutScreen);
