import {
  HeaderActionProps,
  HeaderSecondLevel,
  Stepper,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";

import { useCallback } from "react";
import I18n from "i18next";
import { useStartSupportRequest } from "../../../../hooks/useStartSupportRequest";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/help";
import { useWalletPaymentGoBackHandler } from "../hooks/useWalletPaymentGoBackHandler";
import { walletPaymentSetCurrentStep } from "../store/actions/orchestration";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";
import { WALLET_PAYMENT_STEP_MAX } from "../store/reducers";
import { walletPaymentPspListSelector } from "../store/selectors/psps";
import { WalletPaymentStepEnum } from "../types";
import { WalletPaymentStepScreenNames } from "../utils";
import * as analytics from "../analytics";
import { walletPaymentWebViewPayloadSelector } from "../store/selectors";
import { isPaymentsWebViewFlowEnabledSelector } from "../../../../store/reducers/backendStatus/remoteConfig";

type WalletPaymentHeaderProps = {
  currentStep: number;
};

const WalletPaymentHeader = ({ currentStep }: WalletPaymentHeaderProps) => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const goBackHandler = useWalletPaymentGoBackHandler();
  const webViewPaymentPayload = useIOSelector(
    walletPaymentWebViewPayloadSelector
  );
  const isWebViewEnabled = useIOSelector(isPaymentsWebViewFlowEnabledSelector);

  const pspListPot = useIOSelector(walletPaymentPspListSelector);
  const pspList = pot.getOrElse(pspListPot, []);

  const startSupportRequest = useStartSupportRequest({
    faqCategories: ["payment"],
    contextualHelp: emptyContextualHelp
  });

  const handleGoBack = useCallback(() => {
    if (currentStep === WalletPaymentStepEnum.PICK_PAYMENT_METHOD) {
      analytics.trackPaymentBack(
        WalletPaymentStepScreenNames[WalletPaymentStepEnum.PICK_PAYMENT_METHOD]
      );
      // If we are in the first step, if the goBackHandler is defined (payment was started)
      // call it, otherwise use the default navigation goBack function
      return (goBackHandler || navigation.goBack)();
    } else if (
      currentStep === WalletPaymentStepEnum.CONFIRM_TRANSACTION &&
      pspList.length === 1
    ) {
      analytics.trackPaymentBack(
        WalletPaymentStepScreenNames[WalletPaymentStepEnum.CONFIRM_TRANSACTION]
      );
      // If we are in the last step, if there is one PSP go back to the method selection
      dispatch(
        walletPaymentSetCurrentStep(WalletPaymentStepEnum.PICK_PAYMENT_METHOD)
      );
    } else {
      analytics.trackPaymentBack(
        WalletPaymentStepScreenNames[WalletPaymentStepEnum.PICK_PSP]
      );
      // For any other step just go back 1 step
      dispatch(walletPaymentSetCurrentStep(currentStep - 1));
    }
  }, [navigation, dispatch, goBackHandler, currentStep, pspList]);

  useHardwareBackButton(() => {
    // If the webViewPaymentPayload is defined and the webView is enabled
    // we handle the back behavior in the webView component
    if (webViewPaymentPayload && isWebViewEnabled) {
      return false;
    } else {
      handleGoBack();
      return true;
    }
  });

  return (
    <>
      <HeaderSecondLevel
        title=""
        type="singleAction"
        goBack={handleGoBack}
        backAccessibilityLabel={I18n.t("global.buttons.back")}
        firstAction={{
          icon: "help" as HeaderActionProps["icon"],
          onPress: startSupportRequest,
          accessibilityLabel: I18n.t(
            "global.accessibility.contextualHelp.open.label"
          )
        }}
      />
      <Stepper steps={WALLET_PAYMENT_STEP_MAX} currentStep={currentStep} />
      <VSpacer size={16} />
    </>
  );
};

export { WalletPaymentHeader };
