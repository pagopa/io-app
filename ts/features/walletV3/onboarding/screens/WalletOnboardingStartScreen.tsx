/* eslint-disable functional/immutable-data */
import * as React from "react";

import { useNavigation } from "@react-navigation/native";
import { View } from "react-native";

import I18n from "../../../../i18n";
import { WalletOnboardingStackNavigation } from "../navigation/navigator";

import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import WalletOnboardingSuccess from "../components/WalletOnboardingSuccess";
import { OnboardingOutcome, OnboardingResult } from "../types";
import WalletOnboardingError from "../components/WalletOnboardingError";
import WalletOnboardingWebView from "../components/WalletOnboardingWebView";

const WalletOnboardingStartScreen = () => {
  const navigation = useNavigation<WalletOnboardingStackNavigation>();

  const [onboardingResult, setOnboardingResult] =
    React.useState<OnboardingResult>();

  const handleOnboardingError = () => {
    setOnboardingResult({
      status: "ERROR"
    });
  };

  const handleOnboardingFailure = (outcome: OnboardingOutcome) => {
    setOnboardingResult({
      status: "FAILURE",
      outcome
    });
  };

  const handleOnboardingSuccess = (outcome: OnboardingOutcome) => {
    setOnboardingResult({
      status: "SUCCESS",
      outcome
    });
  };

  if (onboardingResult) {
    return (
      <OnboardingResultContent
        onboardingResult={onboardingResult}
        onClose={() => navigation.pop()}
        onContinue={() => navigation.pop()}
      />
    );
  }

  return (
    <BaseScreenComponent
      customRightIcon={{
        iconName: "closeLarge",
        onPress: () => navigation.pop(),
        accessibilityLabel: I18n.t("global.accessibility.contextualHelp.close")
      }}
    >
      <WalletOnboardingWebView
        onSuccess={handleOnboardingSuccess}
        onError={handleOnboardingError}
        onFailure={handleOnboardingFailure}
      />
    </BaseScreenComponent>
  );
};

type OnboardingResultContentProps = {
  onboardingResult: OnboardingResult;
  onClose: () => void;
  onContinue: () => void;
};

/**
 * This component is used to display the result of the onboarding process
 * @param onboardingResult the result of the onboarding process
 * @param onContinue callback to be called when the user tap on 'Continue' button into success screen
 * @param onClose callback to be called when the user tap on 'Close' button into error screen
 */
const OnboardingResultContent = ({
  onboardingResult,
  onContinue,
  onClose
}: OnboardingResultContentProps) => (
  <View style={IOStyles.flex}>
    {onboardingResult.status === "SUCCESS" && (
      <WalletOnboardingSuccess onContinue={onContinue} />
    )}
    {(onboardingResult.status === "ERROR" ||
      onboardingResult.status === "FAILURE") && (
      <WalletOnboardingError
        outcome={onboardingResult.outcome}
        onClose={onClose}
      />
    )}
  </View>
);

export default WalletOnboardingStartScreen;
