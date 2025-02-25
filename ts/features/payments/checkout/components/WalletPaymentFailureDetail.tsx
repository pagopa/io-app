import { IOToast } from "@pagopa/io-app-design-system";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { openWebUrl } from "../../../../utils/url";
import {
  paymentAnalyticsDataSelector,
  selectOngoingPaymentHistory
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

type Props = {
  failure: WalletPaymentFailure;
};

const WalletPaymentFailureDetail = ({ failure }: Props) => {
  const { name: routeName } = useRoute();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const supportModal = usePaymentFailureSupportModal({ failure });
  const paymentOngoingHistory = useIOSelector(selectOngoingPaymentHistory);
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
    pictogram: "umbrellaNew",
    title: I18n.t("wallet.payment.failure.GENERIC_ERROR.title"),
    subtitle: I18n.t("wallet.payment.failure.GENERIC_ERROR.subtitle"),
    action: closeAction,
    secondaryAction: contactSupportAction
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
    faultCodeCategory
  }: WalletPaymentFailure): OperationResultScreenContentProps => {
    switch (faultCodeCategory) {
      case "PAYMENT_UNAVAILABLE":
        return {
          pictogram: "fatalError",
          title: I18n.t("wallet.payment.failure.PAYMENT_UNAVAILABLE.title"),
          action: contactSupportAction,
          secondaryAction: closeAction
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
      case "PAYMENT_ONGOING":
        return {
          pictogram: "timing",
          title: I18n.t("wallet.payment.failure.PAYMENT_ONGOING.title"),
          subtitle: I18n.t("wallet.payment.failure.PAYMENT_ONGOING.subtitle"),
          action: closeAction,
          secondaryAction: contactSupportAction
        };
      case "PAYMENT_EXPIRED":
        return {
          pictogram: "time",
          title: I18n.t("wallet.payment.failure.PAYMENT_EXPIRED.title"),
          subtitle: I18n.t("wallet.payment.failure.PAYMENT_EXPIRED.subtitle"),
          action: closeAction
        };
      case "PAYMENT_CANCELED":
        return {
          pictogram: "stopSecurity",
          title: I18n.t("wallet.payment.failure.PAYMENT_CANCELED.title"),
          subtitle: I18n.t("wallet.payment.failure.PAYMENT_CANCELED.subtitle"),
          action: closeAction,
          secondaryAction: discoverMoreAction
        };
      case "PAYMENT_DUPLICATED":
        return {
          pictogram: "moneyCheck",
          title: I18n.t("wallet.payment.failure.PAYMENT_DUPLICATED.title"),
          action: closeAction
        };
      case "PAYMENT_UNKNOWN":
        return {
          pictogram: "searchLens",
          title: I18n.t("wallet.payment.failure.PAYMENT_UNKNOWN.title"),
          subtitle: I18n.t("wallet.payment.failure.PAYMENT_UNKNOWN.subtitle"),
          action: closeAction
        };
      case "PAYMENT_VERIFY_GENERIC_ERROR":
        return {
          pictogram: "umbrellaNew",
          title: I18n.t(
            "wallet.payment.failure.PAYMENT_VERIFY_GENERIC_ERROR.title"
          ),
          subtitle: I18n.t(
            "wallet.payment.failure.PAYMENT_VERIFY_GENERIC_ERROR.subtitle"
          ),
          action: closeAction,
          secondaryAction: contactSupportAction
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
          pictogram: "umbrellaNew",
          title: I18n.t("wallet.payment.failure.PAYMENT_SLOWDOWN_ERROR.title"),
          subtitle: I18n.t(
            "wallet.payment.failure.PAYMENT_SLOWDOWN_ERROR.subtitle"
          ),
          action: closeAction,
          secondaryAction: contactSupportAction
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
