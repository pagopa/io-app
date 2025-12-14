import {
  Body,
  ListItemHeader,
  ModuleCheckout,
  VSpacer
} from "@pagopa/io-app-design-system";
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect } from "@react-navigation/native";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { useCallback, useEffect } from "react";
import { AccessibilityInfo } from "react-native";
import I18n from "i18next";
import { AmountEuroCents } from "../../../../../definitions/pagopa/ecommerce/AmountEuroCents";
import IOMarkdown from "../../../../components/IOMarkdown";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { capitalize } from "../../../../utils/strings";
import { UIWalletInfoDetails } from "../../common/types/UIWalletInfoDetails";
import { getPaymentLogoFromWalletDetails } from "../../common/utils";
import { paymentAnalyticsDataSelector } from "../../history/store/selectors";
import * as analytics from "../analytics";
import { WalletPaymentTotalAmount } from "../components/WalletPaymentTotalAmount";
import { useWalletPaymentAuthorizationModal } from "../hooks/useWalletPaymentAuthorizationModal";
import { PaymentsCheckoutRoutes } from "../navigation/routes";
import { walletPaymentSetCurrentStep } from "../store/actions/orchestration";
import {
  selectPaymentsOnboardedWalletId,
  selectPaymentsOrderId,
  selectWalletPaymentCurrentStep,
  walletPaymentDetailsSelector
} from "../store/selectors";
import {
  walletPaymentSelectedPaymentMethodIdOptionSelector,
  walletPaymentSelectedPaymentMethodManagementOptionSelector,
  walletPaymentSelectedPaymentMethodOptionSelector,
  walletPaymentSelectedWalletIdOptionSelector,
  walletPaymentSelectedWalletOptionSelector
} from "../store/selectors/paymentMethods";
import {
  walletPaymentPspListSelector,
  walletPaymentSelectedPspSelector
} from "../store/selectors/psps";
import { walletPaymentTransactionSelector } from "../store/selectors/transaction";
import { WalletPaymentStepEnum } from "../types";
import {
  WalletPaymentOutcome,
  WalletPaymentOutcomeEnum
} from "../types/PaymentOutcomeEnum";
import { getTxtNodeKey } from "../../../../components/IOMarkdown/renderRules";

const WalletPaymentConfirmScreen = () => {
  const navigation = useIONavigation();

  const paymentDetailsPot = useIOSelector(walletPaymentDetailsSelector);
  const transactionPot = useIOSelector(walletPaymentTransactionSelector);
  const currentStep = useIOSelector(selectWalletPaymentCurrentStep);
  const currentOrderId = useIOSelector(selectPaymentsOrderId);
  const selectedWalletIdOption = useIOSelector(
    walletPaymentSelectedWalletIdOptionSelector
  );
  const onboardedWalletId = useIOSelector(selectPaymentsOnboardedWalletId);
  const selectedPaymentMethodIdOption = useIOSelector(
    walletPaymentSelectedPaymentMethodIdOptionSelector
  );
  const selectedPaymentMethodManagement = useIOSelector(
    walletPaymentSelectedPaymentMethodManagementOptionSelector
  );
  const paymentAnalyticsData = useIOSelector(paymentAnalyticsDataSelector);

  const selectedPspOption = useIOSelector(walletPaymentSelectedPspSelector);

  const handleStartPaymentAuthorization = () =>
    pipe(
      sequenceS(O.Monad)({
        paymentDetail: pot.toOption(paymentDetailsPot),
        paymentMethodId: selectedPaymentMethodIdOption,
        selectedPsp: selectedPspOption,
        transaction: pot.toOption(transactionPot)
      }),
      O.map(({ paymentDetail, paymentMethodId, selectedPsp, transaction }) => {
        // In case of guest payment walletId could be undefined
        const walletId =
          O.toUndefined(selectedWalletIdOption) ?? onboardedWalletId;
        const paymentMethodManagement = O.toUndefined(
          selectedPaymentMethodManagement
        );
        const isAllCCP = pipe(
          transaction.payments[0],
          O.fromNullable,
          O.chainNullableK(payment => payment.isAllCCP),
          O.getOrElse(() => false)
        );

        analytics.trackPaymentConversion({
          attempt: paymentAnalyticsData?.attempt,
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
          data_entry: paymentAnalyticsData?.startOrigin
        });

        startPaymentAuthorizaton({
          orderId: currentOrderId,
          paymentAmount: paymentDetail.amount as AmountEuroCents,
          paymentFees: (selectedPsp.taxPayerFee ?? 0) as AmountEuroCents,
          pspId: selectedPsp.idPsp ?? "",
          isAllCCP,
          transactionId: transaction.transactionId,
          walletId,
          paymentMethodId,
          paymentMethodManagement
        });
      })
    );

  const handleAuthorizationOutcome = useCallback(
    (outcome: WalletPaymentOutcome) => {
      navigation.replace(PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR, {
        screen: PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_OUTCOME,
        params: {
          outcome
        }
      });
    },
    [navigation]
  );

  const {
    isLoading: isAuthUrlLoading,
    isError: isAuthUrlError,
    isPendingAuthorization,
    startPaymentAuthorizaton
  } = useWalletPaymentAuthorizationModal({
    onAuthorizationOutcome: handleAuthorizationOutcome
  });

  const isLoading = isAuthUrlLoading || isPendingAuthorization;
  const isError = isAuthUrlError;

  useEffect(() => {
    if (isError) {
      handleAuthorizationOutcome(WalletPaymentOutcomeEnum.AUTH_REQUEST_ERROR);
    }
  }, [isError, handleAuthorizationOutcome]);

  useFocusEffect(
    useCallback(() => {
      if (currentStep !== WalletPaymentStepEnum.CONFIRM_TRANSACTION) {
        return;
      }
      analytics.trackPaymentSummaryScreen({
        attempt: paymentAnalyticsData?.attempt,
        organization_name: paymentAnalyticsData?.verifiedData?.paName,
        organization_fiscal_code:
          paymentAnalyticsData?.verifiedData?.paFiscalCode,
        service_name: paymentAnalyticsData?.serviceName,
        amount: paymentAnalyticsData?.formattedAmount,
        expiration_date: paymentAnalyticsData?.verifiedData?.dueDate,
        saved_payment_method:
          paymentAnalyticsData?.savedPaymentMethods?.length || 0,
        selected_psp_flag: paymentAnalyticsData?.selectedPspFlag,
        payment_method_selected: paymentAnalyticsData?.selectedPaymentMethod
      });
      // should be called only when the current step is the confirm screen
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep])
  );

  const totalAmount = pipe(
    sequenceS(O.Monad)({
      taxFee: pipe(
        selectedPspOption,
        O.chainNullableK(({ taxPayerFee }) => taxPayerFee)
      ),
      paymentAmount: pipe(
        pot.toOption(paymentDetailsPot),
        O.map(({ amount }) => amount)
      )
    }),
    O.map(({ taxFee, paymentAmount }) => +paymentAmount + +taxFee),
    O.getOrElse(() => 0)
  );

  useEffect(() => {
    if (currentStep === WalletPaymentStepEnum.CONFIRM_TRANSACTION) {
      AccessibilityInfo.announceForAccessibility(
        I18n.t("payment.confirm.a11y.announce")
      );
    }
  }, [currentStep]);

  const pspName = pipe(
    selectedPspOption,
    O.chainNullableK(({ pspBusinessName }) => pspBusinessName),
    O.getOrElse(() => "")
  );

  const onLinkPress = (url: string) => openAuthenticationSession(url, "https");

  return (
    <IOScrollView
      actions={{
        type: "SingleButton",
        primary: {
          label: `${I18n.t("payment.confirm.pay")} ${formatNumberCentsToAmount(
            totalAmount,
            true,
            "right"
          )}`,
          accessibilityLabel: `${I18n.t(
            "payment.confirm.pay"
          )} ${formatNumberCentsToAmount(totalAmount, true, "right")}`,
          onPress: handleStartPaymentAuthorization,
          disabled: isLoading,
          loading: isLoading
        }
      }}
    >
      <ListItemHeader
        label={I18n.t("payment.confirm.payWith")}
        accessibilityLabel={I18n.t("payment.confirm.payWith")}
        iconName="creditCard"
      />
      <SelectedPaymentMethodModuleCheckout />
      <VSpacer size={24} />
      <ListItemHeader
        label={I18n.t("payment.confirm.fee")}
        accessibilityLabel={I18n.t("payment.confirm.fee")}
        iconName="psp"
      />
      <SelectedPspModuleCheckout pspName={pspName} />
      <VSpacer size={24} />
      <WalletPaymentTotalAmount totalAmount={totalAmount} />
      <VSpacer size={16} />
      <IOMarkdown
        rules={{
          Link: (param, renderer) => (
            <Body
              asLink
              key={getTxtNodeKey(param)}
              weight="Semibold"
              onPress={() => onLinkPress(param.url)}
              accessibilityRole="link"
            >
              {param.children.map(child => renderer(child))}
            </Body>
          )
        }}
        content={I18n.t("payment.confirm.termsAndConditions", {
          pspName
        })}
      />
    </IOScrollView>
  );
};

const SelectedPaymentMethodModuleCheckout = () => {
  const dispatch = useIODispatch();

  const selectedWalletOption = useIOSelector(
    walletPaymentSelectedWalletOptionSelector
  );
  const selectedPaymentMethodOption = useIOSelector(
    walletPaymentSelectedPaymentMethodOptionSelector
  );
  const paymentAnalyticsData = useIOSelector(paymentAnalyticsDataSelector);

  const handleOnPress = () => {
    analytics.trackPaymentSummaryEditing({
      payment_method_selected: paymentAnalyticsData?.selectedPaymentMethod,
      saved_payment_method:
        paymentAnalyticsData?.savedPaymentMethods?.length || 0,
      expiration_date: paymentAnalyticsData?.verifiedData?.dueDate,
      selected_psp_flag: paymentAnalyticsData?.selectedPspFlag,
      editing: "payment_method",
      amount: paymentAnalyticsData?.formattedAmount
    });
    dispatch(
      walletPaymentSetCurrentStep(WalletPaymentStepEnum.PICK_PAYMENT_METHOD)
    );
  };

  if (O.isSome(selectedWalletOption) && selectedWalletOption.value.details) {
    const details = selectedWalletOption.value.details;
    const paymentLogo = getPaymentLogoFromWalletDetails(details);
    const imageProps = {
      ...(paymentLogo !== undefined
        ? { paymentLogo }
        : { image: { uri: selectedWalletOption.value.paymentMethodAsset } })
    };

    return (
      <ModuleCheckout
        title={getPaymentTitle(details)}
        subtitle={getPaymentSubtitle(details)}
        ctaText={I18n.t("payment.confirm.editButton")}
        onPress={handleOnPress}
        {...imageProps}
      />
    );
  }

  if (O.isSome(selectedPaymentMethodOption)) {
    return (
      <ModuleCheckout
        title={selectedPaymentMethodOption.value.description}
        ctaText={I18n.t("payment.confirm.editButton")}
        onPress={handleOnPress}
        image={{ uri: selectedPaymentMethodOption.value.asset }}
      />
    );
  }

  return null;
};

type SelectedPspModuleCheckoutProps = {
  pspName: string;
};

const SelectedPspModuleCheckout = ({
  pspName
}: SelectedPspModuleCheckoutProps) => {
  const dispatch = useIODispatch();

  const pspListPot = useIOSelector(walletPaymentPspListSelector);
  const selectedPspOption = useIOSelector(walletPaymentSelectedPspSelector);
  const paymentAnalyticsData = useIOSelector(paymentAnalyticsDataSelector);
  const pspList = pot.getOrElse(pspListPot, []);

  const taxFee = pipe(
    selectedPspOption,
    O.chainNullableK(({ taxPayerFee }) => taxPayerFee),
    O.getOrElse(() => 0)
  );

  const handleOnPress = () => {
    analytics.trackPaymentSummaryEditing({
      payment_method_selected: paymentAnalyticsData?.selectedPaymentMethod,
      saved_payment_method:
        paymentAnalyticsData?.savedPaymentMethods?.length || 0,
      expiration_date: paymentAnalyticsData?.verifiedData?.dueDate,
      selected_psp_flag: paymentAnalyticsData?.selectedPspFlag,
      editing: "psp",
      amount: paymentAnalyticsData?.formattedAmount
    });
    dispatch(walletPaymentSetCurrentStep(WalletPaymentStepEnum.PICK_PSP));
  };

  return (
    <ModuleCheckout
      ctaText={
        pspList.length > 1 ? I18n.t("payment.confirm.editButton") : undefined
      }
      title={formatNumberCentsToAmount(taxFee, true, "right")}
      subtitle={`${I18n.t("payment.confirm.feeAppliedBy")} ${pspName}`}
      onPress={handleOnPress}
    />
  );
};

const getPaymentSubtitle = (
  details: UIWalletInfoDetails
): string | undefined => {
  if (details.maskedEmail !== undefined) {
    return I18n.t("wallet.onboarding.paypal.name");
  } else if (details.maskedNumber !== undefined) {
    return `${details.bankName}`;
  }
  return undefined;
};

const getPaymentTitle = (details: UIWalletInfoDetails): string => {
  if (details.lastFourDigits !== undefined) {
    return `${capitalize(details.brand || "")} ••${details.lastFourDigits}`;
  } else if (details.maskedEmail !== undefined) {
    return `${details.maskedEmail}`;
  } else if (details.maskedNumber !== undefined) {
    return `${details.maskedNumber}`;
  }

  return "";
};

export { WalletPaymentConfirmScreen };
