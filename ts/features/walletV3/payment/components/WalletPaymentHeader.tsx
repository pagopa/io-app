import {
  ActionProp,
  HeaderSecondLevel,
  Stepper,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { useStartSupportRequest } from "../../../../hooks/useStartSupportRequest";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useWalletPaymentGoBackHandler } from "../hooks/useWalletPaymentGoBackHandler";
import { walletPaymentSetCurrentStep } from "../store/actions/orchestration";

type WalletPaymentHeaderProps = {
  currentStep: number;
};

const WalletPaymentHeader = ({ currentStep }: WalletPaymentHeaderProps) => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const goBackHandler = useWalletPaymentGoBackHandler();

  const startSupportRequest = useStartSupportRequest({
    faqCategories: ["payment"],
    contextualHelp: emptyContextualHelp
  });

  const handleGoBack = React.useCallback(() => {
    if (currentStep === 1 && goBackHandler) {
      return goBackHandler();
    }

    if (currentStep === 1) {
      return navigation.goBack();
    }

    dispatch(walletPaymentSetCurrentStep(currentStep - 1));
  }, [navigation, dispatch, goBackHandler, currentStep]);

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
      <Stepper steps={4} currentStep={currentStep} />
      <VSpacer size={16} />
    </>
  );
};

export { WalletPaymentHeader };
