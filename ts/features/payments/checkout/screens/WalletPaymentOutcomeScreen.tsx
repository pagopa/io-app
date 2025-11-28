import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { useEffect } from "react";
import I18n from "i18next";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { profileEmailSelector } from "../../../settings/common/store/selectors";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { WalletPaymentFeebackBanner } from "../components/WalletPaymentFeedbackBanner";
import { usePaymentFailureSupportModal } from "../hooks/usePaymentFailureSupportModal";
import { PaymentsCheckoutParamsList } from "../navigation/params";
import {
  selectWalletPaymentCurrentStep,
  walletPaymentDetailsSelector,
  walletPaymentOnSuccessActionSelector
} from "../store/selectors";
import {
  WalletPaymentOutcome,
  WalletPaymentOutcomeEnum
} from "../types/PaymentOutcomeEnum";
import ROUTES from "../../../../navigation/routes";
import { PaymentsOnboardingRoutes } from "../../onboarding/navigation/routes";
import * as analytics from "../analytics";
import {
  paymentAnalyticsDataSelector,
  selectOngoingPaymentHistory
} from "../../history/store/selectors";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { getPaymentPhaseFromStep } from "../utils";
import {
  paymentCompletedSuccess,
  walletPaymentSetCurrentStep
} from "../store/actions/orchestration";
import { walletPaymentSelectedPspSelector } from "../store/selectors/psps";
import { PaymentsCheckoutRoutes } from "../navigation/routes";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { getPaymentsLatestReceiptAction } from "../../receipts/store/actions";
import { usePaymentReversedInfoBottomSheet } from "../hooks/usePaymentReversedInfoBottomSheet";
import { WalletPaymentStepEnum } from "../types";
import { useAppFeedbackContext } from "../../../appReviews/components/AppFeedbackProvider";

type WalletPaymentOutcomeScreenNavigationParams = {
  outcome: WalletPaymentOutcome;
};

type WalletPaymentOutcomeRouteProps = RouteProp<
  PaymentsCheckoutParamsList,
  "PAYMENT_CHECKOUT_OUTCOME"
>;

export const REFETCH_LATEST_RECEIPTS_DELAY_MS = 3000;

const WalletPaymentOutcomeScreen = () => {
  useAvoidHardwareBackButton();
  const { requestFeedback } = useAppFeedbackContext();
  const dispatch = useIODispatch();
  const { params } = useRoute<WalletPaymentOutcomeRouteProps>();
  const { outcome } = params;

  const navigation = useIONavigation();
  const paymentDetailsPot = useIOSelector(walletPaymentDetailsSelector);
  const onSuccessAction = useIOSelector(walletPaymentOnSuccessActionSelector);
  const profileEmailOption = useIOSelector(profileEmailSelector);
  const paymentOngoingHistory = useIOSelector(selectOngoingPaymentHistory);
  const paymentAnalyticsData = useIOSelector(paymentAnalyticsDataSelector);
  const currentStep = useIOSelector(selectWalletPaymentCurrentStep);
  const selectedPspOption = useIOSelector(walletPaymentSelectedPspSelector);

  const supportModal = usePaymentFailureSupportModal({
    outcome
  });

  const reversedPaymentModal = usePaymentReversedInfoBottomSheet();

  const shouldShowHeader = [
    WalletPaymentOutcomeEnum.PAYMENT_METHODS_NOT_AVAILABLE,
    WalletPaymentOutcomeEnum.PAYMENT_METHODS_EXPIRED
  ].includes(outcome);

  // TODO: This is a workaround to disable swipe back gesture on this screen
  // .. it should be removed as soon as the migration to react-navigation v6 is completed (https://pagopa.atlassian.net/browse/IOBP-522)
  useEffect(() => {
    // Disable swipe if not in the payment methods not available outcome
    if (shouldShowHeader) {
      return;
    }
    navigation.setOptions({ gestureEnabled: false });
    navigation.getParent()?.setOptions({ gestureEnabled: false });
    // Re-enable swipe after going back
    return () => {
      navigation.getParent()?.setOptions({ gestureEnabled: true });
    };
  }, [navigation, shouldShowHeader]);

  useHeaderSecondLevel({
    title: "",
    canGoBack: shouldShowHeader
  });

  const taxFeeAmount = pipe(
    selectedPspOption,
    O.chainNullableK(psp => psp.taxPayerFee),
    O.getOrElse(() => 0)
  );

  const paymentAmount = pipe(
    paymentDetailsPot,
    pot.toOption,
    O.map(({ amount }) =>
      formatNumberCentsToAmount(Number(amount) + taxFeeAmount, true, "right")
    ),
    O.getOrElse(() => "-")
  );

  const handleContactSupport = () => {
    analytics.trackPaymentErrorHelp({
      error: outcome,
      organization_name: paymentAnalyticsData?.verifiedData?.paName,
      organization_fiscal_code:
        paymentAnalyticsData?.verifiedData?.paFiscalCode,
      service_name: paymentAnalyticsData?.serviceName,
      first_time_opening: !paymentAnalyticsData?.attempt ? "yes" : "no",
      expiration_date: paymentAnalyticsData?.verifiedData?.dueDate
    });
    supportModal.present();
  };

  const handleClose = () => {
    // Workaround: this delay-based refetch is used until the API to fetch receipt details by notice code becomes available.
    // The timeout allows enough time for the payment processing to complete before refetching the latest receipts.
    // This ensures that when the user navigates back to the receipts list, the updated list is displayed.
    setTimeout(() => {
      dispatch(getPaymentsLatestReceiptAction.request());
    }, REFETCH_LATEST_RECEIPTS_DELAY_MS);

    if (
      onSuccessAction === "showHome" ||
      onSuccessAction === "showTransaction"
    ) {
      // Currently we do support only navigation to the wallet
      // TODO navigate to the transaction details if payment outcome is success
      navigation.popToTop();
      navigation.navigate(ROUTES.MAIN, {
        screen: ROUTES.PAYMENTS_HOME
      });
      return;
    }
    // for any other case ( including showAARMessage ) pop in enough
    navigation.pop();
  };

  const handleSuccessClose = () => {
    requestFeedback("payments");
    handleClose();
  };

  const handleShowMoreOnReversedPayment = () => {
    reversedPaymentModal.present();
  };

  const closeSuccessAction: OperationResultScreenContentProps["action"] = {
    label: I18n.t("wallet.payment.outcome.SUCCESS.button"),
    accessibilityLabel: I18n.t("wallet.payment.outcome.SUCCESS.button"),
    onPress: handleSuccessClose,
    testID: "wallet-payment-outcome-success-button"
  };

  const closeFailureAction: OperationResultScreenContentProps["action"] = {
    label: I18n.t("global.buttons.close"),
    accessibilityLabel: I18n.t("global.buttons.close"),
    onPress: handleClose
  };

  const contactSupportAction: OperationResultScreenContentProps["action"] = {
    label: I18n.t("wallet.payment.support.button"),
    accessibilityLabel: I18n.t("wallet.payment.support.button"),
    onPress: handleContactSupport
  };

  const resetWalletPaymentStep = () => {
    dispatch(
      walletPaymentSetCurrentStep(WalletPaymentStepEnum.PICK_PAYMENT_METHOD)
    );
  };

  const getOnboardPaymentMethodCloseAction: () => OperationResultScreenContentProps["action"] =
    () => {
      const trackingData = {
        organization_name: paymentAnalyticsData?.verifiedData?.paName,
        organization_fiscal_code:
          paymentAnalyticsData?.verifiedData?.paFiscalCode,
        service_name: paymentAnalyticsData?.serviceName,
        first_time_opening: !paymentAnalyticsData?.attempt ? "yes" : "no",
        expiration_date: paymentAnalyticsData?.verifiedData?.dueDate
      };

      return {
        label: I18n.t(
          "wallet.payment.outcome.PAYMENT_METHODS_NOT_AVAILABLE.secondaryAction"
        ),
        accessibilityLabel: I18n.t(
          "wallet.payment.outcome.PAYMENT_METHODS_NOT_AVAILABLE.secondaryAction"
        ),
        onPress: () => {
          analytics.trackOnboardPaymentMethodCloseAction(outcome, trackingData);
          resetWalletPaymentStep();
          navigation.navigate(
            PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR,
            {
              screen: PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_MAKE
            }
          );
        }
      };
    };

  const getOnboardPaymentMethodAction: () => OperationResultScreenContentProps["action"] =
    () => {
      const trackingData = {
        organization_name: paymentAnalyticsData?.verifiedData?.paName,
        organization_fiscal_code:
          paymentAnalyticsData?.verifiedData?.paFiscalCode,
        service_name: paymentAnalyticsData?.serviceName,
        first_time_opening: !paymentOngoingHistory?.attempt ? "yes" : "no",
        expiration_date: paymentAnalyticsData?.verifiedData?.dueDate
      };
      return {
        label: I18n.t(
          "wallet.payment.outcome.PAYMENT_METHODS_NOT_AVAILABLE.primaryAction"
        ),
        accessibilityLabel: I18n.t(
          "wallet.payment.outcome.PAYMENT_METHODS_NOT_AVAILABLE.primaryAction"
        ),
        onPress: () => {
          analytics.trackOnboardPaymentMethodAction(outcome, trackingData);
          navigation.navigate(
            PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_NAVIGATOR,
            {
              screen: PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_SELECT_METHOD
            }
          );
        }
      };
    };

  const paymentReversedAction: OperationResultScreenContentProps["action"] = {
    label: I18n.t("wallet.payment.outcome.PAYMENT_REVERSED.primaryAction"),
    accessibilityLabel: I18n.t(
      "wallet.payment.outcome.PAYMENT_REVERSED.primaryAction"
    ),
    onPress: handleShowMoreOnReversedPayment
  };

  useOnFirstRender(() => {
    const kind =
      outcome === WalletPaymentOutcomeEnum.SUCCESS
        ? "COMPLETED"
        : outcome === WalletPaymentOutcomeEnum.DUPLICATE_ORDER
        ? "DUPLICATED"
        : undefined;
    const rptId = paymentOngoingHistory?.rptId;

    if (kind && rptId) {
      dispatch(paymentCompletedSuccess({ rptId, kind }));
    }
    trackOutcomeScreen();
  });

  const trackOutcomeScreen = () => {
    if (outcome === WalletPaymentOutcomeEnum.SUCCESS) {
      analytics.trackPaymentOutcomeSuccess({
        attempt: paymentOngoingHistory?.attempt,
        organization_name: paymentAnalyticsData?.verifiedData?.paName,
        organization_fiscal_code:
          paymentAnalyticsData?.verifiedData?.paFiscalCode,
        service_name: paymentAnalyticsData?.serviceName,
        amount: paymentAnalyticsData?.formattedAmount,
        expiration_date: paymentAnalyticsData?.verifiedData?.dueDate,
        payment_method_selected: paymentAnalyticsData?.selectedPaymentMethod,
        saved_payment_method:
          paymentAnalyticsData?.savedPaymentMethods?.length || 0,
        selected_psp_flag: paymentAnalyticsData?.selectedPspFlag,
        data_entry: paymentAnalyticsData?.startOrigin,
        browser_type: paymentAnalyticsData?.browserType
      });
      return;
    }
    analytics.trackPaymentOutcomeFailure(outcome, {
      data_entry: paymentAnalyticsData?.startOrigin,
      first_time_opening: !paymentOngoingHistory?.attempt ? "yes" : "no",
      organization_name: paymentAnalyticsData?.verifiedData?.paName,
      organization_fiscal_code:
        paymentAnalyticsData?.verifiedData?.paFiscalCode,
      service_name: paymentAnalyticsData?.serviceName,
      attempt: paymentOngoingHistory?.attempt,
      expiration_date: paymentAnalyticsData?.verifiedData?.dueDate,
      psp_selected: paymentAnalyticsData?.selectedPsp,
      browser_type: paymentAnalyticsData?.browserType,
      payment_phase: getPaymentPhaseFromStep(currentStep)
    });
  };

  // eslint-disable-next-line complexity
  const getPropsForOutcome = (): OperationResultScreenContentProps => {
    switch (outcome) {
      case WalletPaymentOutcomeEnum.SUCCESS:
        return {
          pictogram: "success",
          title: I18n.t("wallet.payment.outcome.SUCCESS.title", {
            amount: paymentAmount
          }),
          subtitle: I18n.t("wallet.payment.outcome.SUCCESS.subtitle"),
          action: closeSuccessAction,
          enableAnimatedPictogram: true,
          loop: false
        };
      case WalletPaymentOutcomeEnum.GENERIC_ERROR:
      default:
        return {
          pictogram: "umbrella",
          title: I18n.t("wallet.payment.outcome.GENERIC_ERROR.title"),
          subtitle: I18n.t("wallet.payment.outcome.GENERIC_ERROR.subtitle"),
          action: closeFailureAction,
          enableAnimatedPictogram: true
        };
      case WalletPaymentOutcomeEnum.AUTH_ERROR:
        return {
          pictogram: "error",
          title: I18n.t("wallet.payment.outcome.AUTH_ERROR.title"),
          subtitle: I18n.t("wallet.payment.outcome.AUTH_ERROR.subtitle"),
          action: closeFailureAction,
          enableAnimatedPictogram: true,
          loop: false
        };
      case WalletPaymentOutcomeEnum.INVALID_DATA:
        return {
          pictogram: "cardIssue",
          title: I18n.t("wallet.payment.outcome.INVALID_DATA.title"),
          subtitle: I18n.t("wallet.payment.outcome.INVALID_DATA.subtitle"),
          action: closeFailureAction
        };
      case WalletPaymentOutcomeEnum.TIMEOUT:
        return {
          pictogram: "time",
          title: I18n.t("wallet.payment.outcome.TIMEOUT.title"),
          subtitle: I18n.t("wallet.payment.outcome.TIMEOUT.subtitle"),
          action: closeFailureAction
        };
      case WalletPaymentOutcomeEnum.CIRCUIT_ERROR:
        return {
          pictogram: "cardIssue",
          title: I18n.t("wallet.payment.outcome.CIRCUIT_ERROR.title"),
          action: contactSupportAction,
          secondaryAction: closeFailureAction
        };
      case WalletPaymentOutcomeEnum.MISSING_FIELDS:
        return {
          pictogram: "attention",
          title: I18n.t("wallet.payment.outcome.MISSING_FIELDS.title"),
          action: contactSupportAction,
          secondaryAction: closeFailureAction
        };
      case WalletPaymentOutcomeEnum.INVALID_CARD:
        return {
          pictogram: "cardIssue",
          title: I18n.t("wallet.payment.outcome.INVALID_CARD.title"),
          subtitle: I18n.t("wallet.payment.outcome.INVALID_CARD.subtitle"),
          action: closeFailureAction
        };
      case WalletPaymentOutcomeEnum.CANCELED_BY_USER:
        return {
          pictogram: "trash",
          title: I18n.t("wallet.payment.outcome.CANCELED_BY_USER.title"),
          subtitle: I18n.t("wallet.payment.outcome.CANCELED_BY_USER.subtitle"),
          action: closeFailureAction
        };
      case WalletPaymentOutcomeEnum.EXCESSIVE_AMOUNT:
        return {
          pictogram: "error",
          title: I18n.t("wallet.payment.outcome.EXCESSIVE_AMOUNT.title"),
          subtitle: I18n.t("wallet.payment.outcome.EXCESSIVE_AMOUNT.subtitle"),
          action: closeFailureAction,
          enableAnimatedPictogram: true,
          loop: false
        };
      case WalletPaymentOutcomeEnum.INVALID_METHOD:
        return {
          pictogram: "cardIssue",
          title: I18n.t("wallet.payment.outcome.INVALID_METHOD.title"),
          action: contactSupportAction,
          secondaryAction: closeFailureAction
        };
      case WalletPaymentOutcomeEnum.WAITING_CONFIRMATION_EMAIL:
        return {
          pictogram: "timing",
          title: I18n.t(
            "wallet.payment.outcome.WAITING_CONFIRMATION_EMAIL.title"
          ),
          subtitle: pipe(
            profileEmailOption,
            O.map(email =>
              I18n.t(
                "wallet.payment.outcome.WAITING_CONFIRMATION_EMAIL.subtitle",
                { email }
              )
            ),
            O.getOrElse(() =>
              I18n.t(
                "wallet.payment.outcome.WAITING_CONFIRMATION_EMAIL.defaultSubtitle"
              )
            )
          ),
          action: closeFailureAction
        };
      case WalletPaymentOutcomeEnum.METHOD_NOT_ENABLED:
        return {
          pictogram: "activate",
          title: I18n.t("wallet.payment.outcome.METHOD_NOT_ENABLED.title"),
          subtitle: I18n.t(
            "wallet.payment.outcome.METHOD_NOT_ENABLED.subtitle"
          ),
          action: closeFailureAction
        };
      case WalletPaymentOutcomeEnum.PAYMENT_METHODS_NOT_AVAILABLE:
        return {
          pictogram: "cardAdd",
          title: I18n.t(
            "wallet.payment.outcome.PAYMENT_METHODS_NOT_AVAILABLE.title"
          ),
          subtitle: I18n.t(
            "wallet.payment.outcome.PAYMENT_METHODS_NOT_AVAILABLE.subtitle"
          ),
          action: getOnboardPaymentMethodAction(),
          secondaryAction: getOnboardPaymentMethodCloseAction()
        };
      case WalletPaymentOutcomeEnum.PAYMENT_METHODS_EXPIRED:
        return {
          pictogram: "cardAdd",
          title: I18n.t("wallet.payment.outcome.PAYMENT_METHODS_EXPIRED.title"),
          subtitle: I18n.t(
            "wallet.payment.outcome.PAYMENT_METHODS_EXPIRED.subtitle"
          ),
          action: getOnboardPaymentMethodAction(),
          secondaryAction: getOnboardPaymentMethodCloseAction()
        };
      case WalletPaymentOutcomeEnum.PAYMENT_REVERSED:
        return {
          pictogram: "attention",
          title: I18n.t("wallet.payment.outcome.PAYMENT_REVERSED.title"),
          subtitle: I18n.t("wallet.payment.outcome.PAYMENT_REVERSED.subtitle"),
          action: paymentReversedAction,
          secondaryAction: closeFailureAction
        };
      case WalletPaymentOutcomeEnum.PAYPAL_REMOVED_ERROR:
        return {
          pictogram: "error",
          title: I18n.t("wallet.payment.outcome.PAYPAL_REMOVED_ERROR.title"),
          subtitle: I18n.t(
            "wallet.payment.outcome.PAYPAL_REMOVED_ERROR.subtitle"
          ),
          action: closeFailureAction,
          enableAnimatedPictogram: true,
          loop: false
        };
      case WalletPaymentOutcomeEnum.IN_APP_BROWSER_CLOSED_BY_USER:
        return {
          pictogram: "lostConnection",
          title: I18n.t(
            "wallet.payment.outcome.IN_APP_BROWSER_CLOSED_BY_USER.title"
          ),
          subtitle: I18n.t(
            "wallet.payment.outcome.IN_APP_BROWSER_CLOSED_BY_USER.subtitle"
          ),
          action: closeFailureAction
        };
      case WalletPaymentOutcomeEnum.INSUFFICIENT_AVAILABILITY_ERROR:
        return {
          pictogram: "emptyWallet",
          title: I18n.t(
            "wallet.payment.outcome.INSUFFICIENT_AVAILABILITY_ERROR.title"
          ),
          subtitle: I18n.t(
            "wallet.payment.outcome.INSUFFICIENT_AVAILABILITY_ERROR.subtitle"
          ),
          action: closeFailureAction
        };
      case WalletPaymentOutcomeEnum.CVV_ERROR:
        return {
          pictogram: "stopSecurity",
          title: I18n.t("wallet.payment.outcome.CVV_ERROR.title"),
          subtitle: I18n.t("wallet.payment.outcome.CVV_ERROR.subtitle"),
          action: closeFailureAction
        };
      case WalletPaymentOutcomeEnum.PLAFOND_LIMIT_ERROR:
        return {
          pictogram: "meterLimit",
          title: I18n.t("wallet.payment.outcome.PLAFOND_LIMIT_ERROR.title"),
          subtitle: I18n.t(
            "wallet.payment.outcome.PLAFOND_LIMIT_ERROR.subtitle"
          ),
          action: closeFailureAction
        };
      case WalletPaymentOutcomeEnum.BE_NODE_KO:
        return {
          pictogram: "umbrella",
          title: I18n.t("wallet.payment.outcome.BE_NODE_KO.title"),
          subtitle: I18n.t("wallet.payment.outcome.BE_NODE_KO.subtitle"),
          action: closeFailureAction,
          secondaryAction: contactSupportAction,
          enableAnimatedPictogram: true
        };
      case WalletPaymentOutcomeEnum.PSP_ERROR:
        return {
          pictogram: "attention",
          title: I18n.t("wallet.payment.outcome.PSP_ERROR.title"),
          subtitle: I18n.t("wallet.payment.outcome.PSP_ERROR.subtitle"),
          action: closeFailureAction,
          secondaryAction: contactSupportAction
        };
      case WalletPaymentOutcomeEnum.AUTH_REQUEST_ERROR:
        return {
          pictogram: "umbrella",
          title: I18n.t("wallet.payment.outcome.AUTH_REQUEST_ERROR.title"),
          subtitle: I18n.t(
            "wallet.payment.outcome.AUTH_REQUEST_ERROR.subtitle"
          ),
          action: closeFailureAction,
          enableAnimatedPictogram: true
        };
    }
  };

  const requiresFeedback = outcome === WalletPaymentOutcomeEnum.SUCCESS;

  return (
    <>
      <OperationResultScreenContent isHeaderVisible {...getPropsForOutcome()}>
        {requiresFeedback && <WalletPaymentFeebackBanner />}
      </OperationResultScreenContent>
      {supportModal.bottomSheet}
      {reversedPaymentModal.bottomSheet}
    </>
  );
};

export { WalletPaymentOutcomeScreen };
export type { WalletPaymentOutcomeScreenNavigationParams };
