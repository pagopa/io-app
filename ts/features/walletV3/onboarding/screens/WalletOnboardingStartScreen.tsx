/* eslint-disable functional/immutable-data */
import * as React from "react";

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { View } from "react-native";

import I18n from "../../../../i18n";
import { WalletOnboardingParamsList } from "../navigation/navigator";

import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import WalletOnboardingSuccess from "../components/WalletOnboardingSuccess";
import {
  OnboardingOutcomeEnum,
  OnboardingOutcomeFailure,
  OnboardingOutcomeSuccess,
  OnboardingResult
} from "../types";
import WalletOnboardingError from "../components/WalletOnboardingError";
import WalletOnboardingWebView from "../components/WalletOnboardingWebView";
import { WalletDetailsRoutes } from "../../details/navigation/navigator";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";

export type WalletOnboardingStartScreenParams = {
  paymentMethodId: string;
};

type WalletOnboardingStartScreenRouteProps = RouteProp<
  WalletOnboardingParamsList,
  "WALLET_ONBOARDING_START"
>;

const WalletOnboardingStartScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const route = useRoute<WalletOnboardingStartScreenRouteProps>();
  const { paymentMethodId } = route.params;

  const [onboardingResult, setOnboardingResult] =
    React.useState<OnboardingResult>();

  const handleOnboardingError = () => {
    setOnboardingResult({
      status: "ERROR",
      outcome: OnboardingOutcomeEnum.GENERIC_ERROR
    });
  };

  const handleOnboardingFailure = (outcome: OnboardingOutcomeFailure) => {
    setOnboardingResult({
      status: "FAILURE",
      outcome
    });
  };

  const handleOnboardingSuccess = (
    outcome: OnboardingOutcomeSuccess,
    walletId: string
  ) => {
    setOnboardingResult({
      status: "SUCCESS",
      outcome,
      walletId
    });
  };

  const handleContinueButton = () => {
    if (onboardingResult && onboardingResult.status === "SUCCESS") {
      navigation.replace(WalletDetailsRoutes.WALLET_DETAILS_MAIN, {
        screen: WalletDetailsRoutes.WALLET_DETAILS_SCREEN,
        params: {
          walletId: onboardingResult.walletId
        }
      });
    }
  };

  // If the onboarding process is completed (with a success or not), we display the result content feedback
  if (onboardingResult) {
    return (
      <OnboardingResultContent
        onboardingResult={onboardingResult}
        onClose={() => navigation.pop()}
        onContinue={handleContinueButton}
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
        paymentMethodId={paymentMethodId}
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
