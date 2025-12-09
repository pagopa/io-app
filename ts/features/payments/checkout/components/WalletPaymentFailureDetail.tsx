import { IOToast } from "@pagopa/io-app-design-system";
import { useNavigation, useRoute } from "@react-navigation/native";
import I18n from "i18next";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { openWebUrl } from "../../../../utils/url";
import {
  paymentAnalyticsDataSelector,
  selectOngoingPaymentHistory,
  selectPaymentsOngoingFailed
} from "../../history/store/selectors";
import * as analytics from "../analytics";
import { usePaymentFailureSupportModal } from "../hooks/usePaymentFailureSupportModal";
import { PaymentsCheckoutRoutes } from "../navigation/routes";
import { paymentsCalculatePaymentFeesAction } from "../store/actions/networking";
import { paymentCompletedSuccess } from "../store/actions/orchestration";
import { selectWalletPaymentCurrentStep } from "../store/selectors";
import { WalletPaymentFailure } from "../types/WalletPaymentFailure";
import { CHECKOUT_ASSISTANCE_ARTICLE, getPaymentPhaseFromStep } from "../utils";
import { trackHelpCenterCtaTapped } from "../../../../utils/analytics";

export const HC_PAYMENT_CANCELED_ERROR_ID = "PAYMENT_CANCELED_ERROR";

const PAYMENT_ONGOING_FAILURE_WAIT_TIME = 15 * 60 * 1000; // 15 minutes

type Props = {
  failure: WalletPaymentFailure;
};

const WalletPaymentFailureDetail = ({ failure }: Props) => {
  const { name: routeName } = useRoute();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const supportModal = usePaymentFailureSupportModal({ failure });
  const paymentOngoingHistory = useIOSelector(selectOngoingPaymentHistory);
  const paymentOngoingFailed = useIOSelector(selectPaymentsOngoingFailed);
  const dispatch = useIODispatch();
  const paymentAnalyticsData = useIOSelector(paymentAnalyticsDataSelector);
  const currentStep = useIOSelector(selectWalletPaymentCurrentStep);

  const handleClose = () => {
    navigation.pop();
  };

  const handleContactSupport = () => {
    analytics.trackPaymentErrorHelp({
      error: failure.faultCodeCategory,
      organization_name: paymentAnalyticsData?.verifiedData?.paName,
      organization_fiscal_code:
        paymentAnalyticsData?.verifiedData?.paFiscalCode,
      service_name: paymentAnalyticsData?.serviceName,
      first_time_opening: !paymentAnalyticsData?.attempt ? "yes" : "no",
      expiration_date: paymentAnalyticsData?.verifiedData?.dueDate
    });
    supportModal.present();
  };

  const handleChangePaymentMethod = () => {
    analytics.trackPaymentsPspNotAvailableSelectNew({
      attempt: paymentAnalyticsData?.attempt,
      organization_name: paymentAnalyticsData?.verifiedData?.paName,
      organization_fiscal_code:
        paymentAnalyticsData?.verifiedData?.paFiscalCode,
      amount: paymentAnalyticsData?.formattedAmount,
      saved_payment_method:
        paymentAnalyticsData?.savedPaymentMethods?.length ?? 0,
      expiration_date: paymentAnalyticsData?.verifiedData?.dueDate,
      payment_method_selected: paymentAnalyticsData?.selectedPaymentMethod,
      selected_psp_flag: paymentAnalyticsData?.selectedPspFlag
    });

    dispatch(paymentsCalculatePaymentFeesAction.cancel());
    navigation.replace(PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR, {
      screen: PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_MAKE
    });
  };

  const handleDiscoverMore = () => {
    trackHelpCenterCtaTapped(
      HC_PAYMENT_CANCELED_ERROR_ID,
      CHECKOUT_ASSISTANCE_ARTICLE,
      routeName
    );
    openWebUrl(CHECKOUT_ASSISTANCE_ARTICLE, () =>
      IOToast.error(I18n.t("genericError"))
    );
  };

  const closeAction: OperationResultScreenContentProps["action"] = {
    label: I18n.t("global.buttons.close"),
    testID: "wallet-payment-failure-close-button",
    accessibilityLabel: I18n.t("global.buttons.close"),
    onPress: handleClose
  };

  const contactSupportAction: OperationResultScreenContentProps["action"] = {
    label: I18n.t("wallet.payment.support.button"),
    testID: "wallet-payment-failure-support-button",
    accessibilityLabel: I18n.t("wallet.payment.support.button"),
    onPress: handleContactSupport
  };

  const genericErrorProps: OperationResultScreenContentProps = {
    pictogram: "umbrella",
    title: I18n.t("wallet.payment.failure.GENERIC_ERROR.title"),
    subtitle: I18n.t("wallet.payment.failure.GENERIC_ERROR.subtitle"),
    action: closeAction,
    secondaryAction: contactSupportAction,
    enableAnimatedPictogram: true,
    loop: true
  };

  const discoverMoreAction: OperationResultScreenContentProps["action"] = {
    label: I18n.t("wallet.payment.failure.PAYMENT_CANCELED.action"),
    testID: "wallet-payment-failure-discover-more-button",
    accessibilityLabel: I18n.t(
      "wallet.payment.failure.PAYMENT_CANCELED.action"
    ),
    icon: "categLearning",
    onPress: handleDiscoverMore
  };

  /**
   * Calculates the remaining minutes a user must wait before retrying a payment
   * that previously failed due to an ongoing payment error (e.g., PPT_PAGAMENTO_IN_CORSO).
   *
   * This function uses both `Date.now()` (wall clock) and `performance.now()` (monotonic clock)
   * to mitigate the risk of user manipulation of the system clock or time zone changes.
   *
   * If the discrepancy between the two time sources exceeds a defined threshold (e.g., 60 seconds),
   * it falls back to the more reliable `performance.now()` to determine the elapsed time.
   *
   * @returns The number of minutes the user must wait before retrying the payment. Returns 0 if no wait is required.
   */
  const getPaymentOngoingMinutesToWait = () => {
    const firstTimeFailed = paymentOngoingHistory?.rptId
      ? paymentOngoingFailed?.[paymentOngoingHistory.rptId]
      : undefined;

    if (!firstTimeFailed) {
      return 0;
    }

    const nowWall = Date.now();
    const nowPerf = performance.now();
    const MAX_ALLOWED_DRIFT = 60000;

    const deltaWall = nowWall - firstTimeFailed.wallClock;
    const deltaPerf = nowPerf - firstTimeFailed.appClock;
    const discrepancy = Math.abs(deltaWall - deltaPerf);

    const effectiveElapsed =
      discrepancy > MAX_ALLOWED_DRIFT ? deltaPerf : deltaWall;

    return Math.max(
      Math.ceil((PAYMENT_ONGOING_FAILURE_WAIT_TIME - effectiveElapsed) / 60000),
      0
    );
  };

  const selectOtherPaymentMethodAction: OperationResultScreenContentProps["action"] =
    {
      label: I18n.t(
        "wallet.payment.failure.PSP_PAYMENT_METHOD_NOT_AVAILABLE_ERROR.action"
      ),
      testID: "wallet-payment-failure-go-back-button",
      accessibilityLabel: I18n.t(
        "wallet.payment.failure.PSP_PAYMENT_METHOD_NOT_AVAILABLE_ERROR.action"
      ),
      onPress: handleChangePaymentMethod
    };

  const getPropsFromFailure = ({
    faultCodeCategory,
    faultCodeDetail
  }: WalletPaymentFailure): OperationResultScreenContentProps => {
    switch (faultCodeCategory) {
      case "PAYMENT_UNAVAILABLE":
        return {
          pictogram: "fatalError",
          title: I18n.t("wallet.payment.failure.PAYMENT_UNAVAILABLE.title"),
          action: contactSupportAction,
          secondaryAction: closeAction,
          enableAnimatedPictogram: true,
          loop: false
        };
      case "PAYMENT_DATA_ERROR":
        return {
          pictogram: "attention",
          title: I18n.t("wallet.payment.failure.PAYMENT_DATA_ERROR.title"),
          action: closeAction,
          secondaryAction: contactSupportAction
        };
      case "DOMAIN_UNKNOWN":
        return {
          pictogram: "comunicationProblem",
          title: I18n.t("wallet.payment.failure.DOMAIN_UNKNOWN.title"),
          subtitle: I18n.t("wallet.payment.failure.DOMAIN_UNKNOWN.subtitle"),
          action: closeAction,
          secondaryAction: contactSupportAction
        };
      case "PAYMENT_ONGOING": {
        if (faultCodeDetail === "PAA_PAGAMENTO_IN_CORSO") {
          return {
            pictogram: "timing",
            title: I18n.t(
              "wallet.payment.failure.PAYMENT_ONGOING.PAA_PAGAMENTO_IN_CORSO.title"
            ),
            subtitle: I18n.t(
              "wallet.payment.failure.PAYMENT_ONGOING.PAA_PAGAMENTO_IN_CORSO.subtitle"
            ),
            action: closeAction,
            secondaryAction: contactSupportAction
          };
        }
        const minutesToWait = getPaymentOngoingMinutesToWait();
        if (faultCodeDetail === "PPT_PAGAMENTO_IN_CORSO" && minutesToWait) {
          return {
            pictogram: "timing",
            title: I18n.t(
              "wallet.payment.failure.PAYMENT_ONGOING.PPT_PAGAMENTO_IN_CORSO.countdownTitle",
              { minutes: minutesToWait }
            ),
            action: closeAction
          };
        }
        return {
          pictogram: "timing",
          title: I18n.t(
            "wallet.payment.failure.PAYMENT_ONGOING.PPT_PAGAMENTO_IN_CORSO.countdownExpiredTitle"
          ),
          subtitle: I18n.t(
            "wallet.payment.failure.PAYMENT_ONGOING.PPT_PAGAMENTO_IN_CORSO.subtitle"
          ),
          action: contactSupportAction,
          secondaryAction: closeAction
        };
      }
      case "PAYMENT_EXPIRED":
        return {
          pictogram: "time",
          title: I18n.t("wallet.payment.failure.PAYMENT_EXPIRED.title"),
          subtitle: I18n.t("wallet.payment.failure.PAYMENT_EXPIRED.subtitle"),
          action: closeAction
        };
      case "PAYMENT_CANCELED":
        return {
          enableAnimatedPictogram: true,
          pictogram: "accessDenied",
          title: I18n.t("wallet.payment.failure.PAYMENT_CANCELED.title"),
          subtitle: I18n.t("wallet.payment.failure.PAYMENT_CANCELED.subtitle"),
          action: closeAction,
          secondaryAction: discoverMoreAction,
          loop: false
        };
      case "PAYMENT_DUPLICATED":
        return {
          pictogram: "moneyCheck",
          title: I18n.t("wallet.payment.failure.PAYMENT_DUPLICATED.title"),
          action: closeAction
        };
      case "PAYMENT_UNKNOWN":
        return {
          enableAnimatedPictogram: true,
          pictogram: "searchLens",
          title: I18n.t("wallet.payment.failure.PAYMENT_UNKNOWN.title"),
          subtitle: I18n.t("wallet.payment.failure.PAYMENT_UNKNOWN.subtitle"),
          action: closeAction
        };
      case "PAYMENT_VERIFY_GENERIC_ERROR":
        return {
          enableAnimatedPictogram: true,
          pictogram: "umbrella",
          title: I18n.t(
            "wallet.payment.failure.PAYMENT_VERIFY_GENERIC_ERROR.title"
          ),
          subtitle: I18n.t(
            "wallet.payment.failure.PAYMENT_VERIFY_GENERIC_ERROR.subtitle"
          ),
          action: closeAction,
          secondaryAction: contactSupportAction,
          loop: true
        };
      case "PSP_PAYMENT_METHOD_NOT_AVAILABLE_ERROR":
        return {
          pictogram: "cardIssue",
          title: I18n.t(
            "wallet.payment.failure.PSP_PAYMENT_METHOD_NOT_AVAILABLE_ERROR.title"
          ),
          subtitle: I18n.t(
            "wallet.payment.failure.PSP_PAYMENT_METHOD_NOT_AVAILABLE_ERROR.subtitle"
          ),
          action: selectOtherPaymentMethodAction
        };
      case "PAYMENT_SLOWDOWN_ERROR":
        return {
          enableAnimatedPictogram: true,
          pictogram: "umbrella",
          title: I18n.t("wallet.payment.failure.PAYMENT_SLOWDOWN_ERROR.title"),
          subtitle: I18n.t(
            "wallet.payment.failure.PAYMENT_SLOWDOWN_ERROR.subtitle"
          ),
          action: closeAction,
          secondaryAction: contactSupportAction,
          loop: true
        };

      default:
        return genericErrorProps;
    }
  };

  const contentProps = getPropsFromFailure(failure);

  useOnFirstRender(() => {
    if (
      paymentOngoingHistory?.rptId &&
      failure.faultCodeCategory === "PAYMENT_DUPLICATED"
    ) {
      dispatch(
        paymentCompletedSuccess({
          rptId: paymentOngoingHistory.rptId,
          kind: "DUPLICATED"
        })
      );
    }
    analytics.trackPaymentRequestFailure(failure, {
      organization_name: paymentAnalyticsData?.verifiedData?.paName,
      organization_fiscal_code:
        paymentAnalyticsData?.verifiedData?.paFiscalCode,
      service_name: paymentAnalyticsData?.serviceName,
      data_entry: paymentAnalyticsData?.startOrigin,
      first_time_opening: !paymentAnalyticsData?.attempt ? "yes" : "no",
      expiration_date: paymentAnalyticsData?.verifiedData?.dueDate,
      payment_phase: getPaymentPhaseFromStep(currentStep)
    });
  });

  return (
    <>
      <OperationResultScreenContent {...contentProps} />
      {supportModal.bottomSheet}
    </>
  );
};

export { WalletPaymentFailureDetail };
