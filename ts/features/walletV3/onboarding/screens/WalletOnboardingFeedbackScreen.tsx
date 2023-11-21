/* eslint-disable functional/immutable-data */
import * as React from "react";

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { View } from "react-native";

import { WalletOnboardingParamsList } from "../navigation/navigator";

import { IOStyles } from "../../../../components/core/variables/IOStyles";
import WalletOnboardingSuccess from "../components/WalletOnboardingSuccess";
import { OnboardingResult } from "../types";
import WalletOnboardingError from "../components/WalletOnboardingError";
import { WalletDetailsRoutes } from "../../details/navigation/navigator";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";

export type WalletOnboardingFeedbackScreenParams = {
  onboardingResult: OnboardingResult;
};

type WalletOnboardingFeedbackScreenRouteProps = RouteProp<
  WalletOnboardingParamsList,
  "WALLET_ONBOARDING_RESULT_FEEDBACK"
>;

const WalletOnboardingFeedbackScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const route = useRoute<WalletOnboardingFeedbackScreenRouteProps>();
  const { onboardingResult } = route.params;

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
  return (
    <OnboardingResultContent
      onboardingResult={onboardingResult}
      onClose={() => navigation.pop()}
      onContinue={handleContinueButton}
    />
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

export default WalletOnboardingFeedbackScreen;
