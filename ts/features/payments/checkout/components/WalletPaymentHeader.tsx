import {
  ActionProp,
  HeaderSecondLevel,
  Stepper,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";

import React from "react";
import { useStartSupportRequest } from "../../../../hooks/useStartSupportRequest";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useWalletPaymentGoBackHandler } from "../hooks/useWalletPaymentGoBackHandler";
import { walletPaymentSetCurrentStep } from "../store/actions/orchestration";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";
import { WALLET_PAYMENT_STEP_MAX } from "../store/reducers";
import { walletPaymentPspListSelector } from "../store/selectors/psps";
import { paymentsResetPaymentPspList } from "../store/actions/networking";
import { WalletPaymentStepEnum } from "../types";

type WalletPaymentHeaderProps = {
  currentStep: number;
};

const WalletPaymentHeader = ({ currentStep }: WalletPaymentHeaderProps) => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const goBackHandler = useWalletPaymentGoBackHandler();

  const pspListPot = useIOSelector(walletPaymentPspListSelector);
  const pspList = pot.getOrElse(pspListPot, []);

  const startSupportRequest = useStartSupportRequest({
    faqCategories: ["payment"],
    contextualHelp: emptyContextualHelp
  });

  const handleGoBack = React.useCallback(() => {
    if (currentStep === WalletPaymentStepEnum.PICK_PAYMENT_METHOD) {
      // If we are in the first step, if the goBackHandler is defined (payment was started)
      // call it, otherwise use the default navigation goBack function
      return (goBackHandler || navigation.goBack)();
    } else if (
      currentStep === WalletPaymentStepEnum.CONFIRM_TRANSACTION &&
      pspList.length === 1
    ) {
      // If we are in the last step, if there is one PSP go back to the method selection
      dispatch(
        walletPaymentSetCurrentStep(WalletPaymentStepEnum.PICK_PAYMENT_METHOD)
      );
      dispatch(paymentsResetPaymentPspList());
    } else {
      // For any other step just go back 1 step
      dispatch(walletPaymentSetCurrentStep(currentStep - 1));
    }
  }, [navigation, dispatch, goBackHandler, currentStep, pspList]);

  useHardwareBackButton(() => {
    handleGoBack();
    return true;
  });

  return (
    <>
      <HeaderSecondLevel
        title=""
        type="singleAction"
        goBack={handleGoBack}
        backAccessibilityLabel={I18n.t("global.buttons.back")}
        firstAction={{
          icon: "help" as ActionProp["icon"],
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
