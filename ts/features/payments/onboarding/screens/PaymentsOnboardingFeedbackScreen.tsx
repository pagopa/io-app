import { IOPictograms } from "@pagopa/io-app-design-system";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import * as O from "fp-ts/lib/Option";
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
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { selectPaymentOnboardingRptIdToResume } from "../store/selectors";
import { usePagoPaPayment } from "../../checkout/hooks/usePagoPaPayment";
import { paymentsResetRptIdToResume } from "../store/actions";

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
  const dispatch = useIODispatch();
  const { outcome, walletId } = route.params;

  const rptIdToResume = useIOSelector(selectPaymentOnboardingRptIdToResume);
  const { startPaymentFlow } = usePagoPaPayment();

  const outcomeEnumKey = Object.keys(WalletOnboardingOutcomeEnum)[
    Object.values(WalletOnboardingOutcomeEnum).indexOf(outcome)
  ] as keyof typeof WalletOnboardingOutcomeEnum;

  React.useEffect(
    () => () => {
      dispatch(paymentsResetRptIdToResume());
    },
    [dispatch]
  );

  const handleContinueButton = () => {
    navigation.popToTop();
    if (outcome === WalletOnboardingOutcomeEnum.SUCCESS && walletId) {
      if (rptIdToResume) {
        // Resume payment flow
        // This implementation will be removed as soon as the backend will migrate totally to the NPG. (https://pagopa.atlassian.net/browse/IOBP-632)
        startPaymentFlow(rptIdToResume);
        return;
      }
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

  const actionButtonLabel = pipe(
    rptIdToResume,
    O.fromNullable,
    O.fold(
      () => I18n.t(`wallet.onboarding.outcome.${outcomeEnumKey}.primaryAction`),
      () => I18n.t(`wallet.onboarding.outcome.SUCCESS.continueAction`)
    )
  );

  return (
    <View style={IOStyles.flex}>
      <OperationResultScreenContent
        title={I18n.t(`wallet.onboarding.outcome.${outcomeEnumKey}.title`)}
        subtitle={I18n.t(
          `wallet.onboarding.outcome.${outcomeEnumKey}.subtitle`
        )}
        pictogram={pictogramByOutcome[outcome]}
        action={{
          label: actionButtonLabel,
          accessibilityLabel: actionButtonLabel,
          onPress: handleContinueButton
        }}
        secondaryAction={renderSecondaryAction()}
      />
    </View>
  );
};

export { PaymentsOnboardingFeedbackScreen };
