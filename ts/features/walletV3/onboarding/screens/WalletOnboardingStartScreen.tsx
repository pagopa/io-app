/* eslint-disable functional/immutable-data */
import * as React from "react";

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { View } from "react-native";

import I18n from "../../../../i18n";
import { WalletOnboardingParamsList } from "../navigation/navigator";

import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import WalletOnboardingSuccess from "../components/WalletOnboardingSuccess";
import { OnboardingOutcome, OnboardingResult } from "../types";
import WalletOnboardingError from "../components/WalletOnboardingError";
import WalletOnboardingWebView from "../components/WalletOnboardingWebView";
import ROUTES from "../../../../navigation/routes";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";

export type WalletOnboardingStartScreenParams = {
  paymentMethodId: string;
};

type WalletOnboardingStartScreenRouteProps = RouteProp<
  WalletOnboardingParamsList,
  "WALLET_ONBOARDING_START"
>;

const WalletOnboardingStartScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<WalletParamsList>>();
  const route = useRoute<WalletOnboardingStartScreenRouteProps>();
  const { paymentMethodId } = route.params;

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

  const handleOnboardingSuccess = (
    outcome: OnboardingOutcome,
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
      navigation.replace(ROUTES.WALLET_NAVIGATOR, {
        screen: ROUTES.WALLET_CREDIT_CARD_DETAIL,
        params: {
          creditCard: {
            // TODO: Replace the behavior of this navigation sending only the idWallet to the detail page (https://pagopa.atlassian.net/browse/IOBP-373)
            idWallet: onboardingResult.walletId
          } as any
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
