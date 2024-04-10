import { IOPictograms } from "@pagopa/io-app-design-system";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import * as React from "react";
import { View } from "react-native";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { openWebUrl } from "../../../../utils/url";
import { PaymentsMethodDetailsRoutes } from "../../details/navigation/routes";
import { PaymentsOnboardingParamsList } from "../navigation/params";
import {
  WalletOnboardingOutcome,
  WalletOnboardingOutcomeEnum
} from "../types/OnboardingOutcomeEnum";
import { ONBOARDING_FAQ_ENABLE_3DS } from "../utils";

export type PaymentsOnboardingFeedbackScreenParams = {
  outcome: WalletOnboardingOutcome;
  walletId?: string;
};

type PaymentsOnboardingFeedbackScreenRouteProps = RouteProp<
  PaymentsOnboardingParamsList,
  "PAYMENT_ONBOARDING_RESULT_FEEDBACK"
>;

export const pictogramByOutcome: Record<WalletOnboardingOutcome, IOPictograms> =
  {
    [WalletOnboardingOutcomeEnum.SUCCESS]: "success",
    [WalletOnboardingOutcomeEnum.GENERIC_ERROR]: "umbrellaNew",
    [WalletOnboardingOutcomeEnum.AUTH_ERROR]: "accessDenied",
    [WalletOnboardingOutcomeEnum.TIMEOUT]: "time",
    [WalletOnboardingOutcomeEnum.CANCELED_BY_USER]: "trash",
    [WalletOnboardingOutcomeEnum.INVALID_SESSION]: "umbrellaNew",
    [WalletOnboardingOutcomeEnum.ALREADY_ONBOARDED]: "success",
    [WalletOnboardingOutcomeEnum.BPAY_NOT_FOUND]: "attention"
  };

const PaymentsOnboardingFeedbackScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const route = useRoute<PaymentsOnboardingFeedbackScreenRouteProps>();
  const { outcome, walletId } = route.params;

  const outcomeEnumKey = Object.keys(WalletOnboardingOutcomeEnum)[
    Object.values(WalletOnboardingOutcomeEnum).indexOf(outcome)
  ] as keyof typeof WalletOnboardingOutcomeEnum;

  const handleContinueButton = () => {
    navigation.popToTop();
    if (outcome === WalletOnboardingOutcomeEnum.SUCCESS && walletId) {
      navigation.reset({
        index: 1,
        routes: [
          {
            name: ROUTES.MAIN,
            params: {
              screen: ROUTES.WALLET_HOME,
              params: {
                newMethodAdded: true
              }
            }
          },
          {
            name: PaymentsMethodDetailsRoutes.PAYMENT_METHOD_DETAILS_NAVIGATOR,
            params: {
              screen: PaymentsMethodDetailsRoutes.PAYMENT_METHOD_DETAILS_SCREEN,
              params: {
                walletId
              }
            }
          }
        ]
      });
    } else {
      navigation.popToTop();
    }
  };

  const renderSecondaryAction = () => {
    switch (outcome) {
      case WalletOnboardingOutcomeEnum.AUTH_ERROR:
        return {
          label: I18n.t(`wallet.onboarding.outcome.AUTH_ERROR.secondaryAction`),
          accessibilityLabel: I18n.t(
            `wallet.onboarding.outcome.AUTH_ERROR.secondaryAction`
          ),
          onPress: () => openWebUrl(ONBOARDING_FAQ_ENABLE_3DS)
        };
    }
    return undefined;
  };

  return (
    <View style={IOStyles.flex}>
      <OperationResultScreenContent
        title={I18n.t(`wallet.onboarding.outcome.${outcomeEnumKey}.title`)}
        subtitle={I18n.t(
          `wallet.onboarding.outcome.${outcomeEnumKey}.subtitle`
        )}
        pictogram={pictogramByOutcome[outcome]}
        action={{
          label: I18n.t(
            `wallet.onboarding.outcome.${outcomeEnumKey}.primaryAction`
          ),
          accessibilityLabel: I18n.t(
            `wallet.onboarding.outcome.${outcomeEnumKey}.primaryAction`
          ),
          onPress: handleContinueButton
        }}
        secondaryAction={renderSecondaryAction()}
      />
    </View>
  );
};

export { PaymentsOnboardingFeedbackScreen };
