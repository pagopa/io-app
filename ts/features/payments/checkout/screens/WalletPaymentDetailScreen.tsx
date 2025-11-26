import {
  Divider,
  H3,
  IOSpacingScale,
  ListItemInfo,
  ListItemInfoCopy,
  VSpacer
} from "@pagopa/io-app-design-system";
import {
  PaymentNoticeNumberFromString,
  RptIdFromString
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute
} from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { ComponentProps, useCallback, useLayoutEffect } from "react";
import { AccessibilityInfo, SafeAreaView, StyleSheet } from "react-native";
import I18n from "i18next";
import { OrganizationFiscalCode } from "../../../../../definitions/backend/OrganizationFiscalCode";
import { PaymentRequestsGetResponse } from "../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { RptId } from "../../../../../definitions/pagopa/ecommerce/RptId";
import IOMarkdown from "../../../../components/IOMarkdown";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { LoadingIndicator } from "../../../../components/ui/LoadingIndicator";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { emptyContextualHelp } from "../../../../utils/contextualHelp";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { cleanTransactionDescription } from "../../../../utils/payment";
import {
  centsToAmount,
  formatNumberAmount
} from "../../../../utils/stringBuilder";
import {
  formatPaymentNoticeNumber,
  isPaymentMethodExpired
} from "../../common/utils";
import { storeNewPaymentAttemptAction } from "../../history/store/actions";
import { paymentAnalyticsDataSelector } from "../../history/store/selectors";
import { paymentsInitOnboardingWithRptIdToResume } from "../../onboarding/store/actions";
import * as analytics from "../analytics";
import { WalletPaymentFailureDetail } from "../components/WalletPaymentFailureDetail";
import { PaymentsCheckoutParamsList } from "../navigation/params";
import { PaymentsCheckoutRoutes } from "../navigation/routes";
import {
  paymentsGetPaymentDetailsAction,
  paymentsGetPaymentUserMethodsAction
} from "../store/actions/networking";
import { walletPaymentSetCurrentStep } from "../store/actions/orchestration";
import { walletPaymentDetailsSelector } from "../store/selectors";
import { walletPaymentEnabledUserWalletsSelector } from "../store/selectors/paymentMethods";
import { WalletPaymentStepEnum } from "../types";
import { WalletPaymentOutcomeEnum } from "../types/PaymentOutcomeEnum";
import { FaultCodeCategoryEnum as FaultCodeSlowdownCategoryEnum } from "../types/PaymentSlowdownErrorProblemJson";
import { WalletPaymentFailure } from "../types/WalletPaymentFailure";
import { formatAndValidateDueDate } from "../utils";

type WalletPaymentDetailScreenNavigationParams = {
  rptId: RptId;
};

type WalletPaymentDetailRouteProps = RouteProp<
  PaymentsCheckoutParamsList,
  "PAYMENT_NOTICE_SUMMARY"
>;

const WalletPaymentDetailScreen = () => {
  const { params } = useRoute<WalletPaymentDetailRouteProps>();
  const { rptId } = params;

  const dispatch = useIODispatch();
  const paymentDetailsPot = useIOSelector(walletPaymentDetailsSelector);

  useFocusEffect(
    useCallback(() => {
      dispatch(paymentsGetPaymentDetailsAction.request(rptId));
    }, [dispatch, rptId])
  );

  useOnFirstRender(
    () => {
      AccessibilityInfo.announceForAccessibility(
        I18n.t("wallet.firstTransactionSummary.a11y.announce")
      );
      analytics.trackPaymentSummaryLoading();
    },
    () => pot.isLoading(paymentDetailsPot)
  );

  if (pot.isError(paymentDetailsPot)) {
    const failure = pipe(
      paymentDetailsPot.error,
      WalletPaymentFailure.decode,
      O.fromEither,
      // NetworkError or undecoded error is transformed to PAYMENT_SLOWDOWN_ERROR only for display purposes
      O.getOrElse<WalletPaymentFailure>(() => ({
        faultCodeCategory: FaultCodeSlowdownCategoryEnum.PAYMENT_SLOWDOWN_ERROR,
        faultCodeDetail:
          (paymentDetailsPot.error as WalletPaymentFailure)?.faultCodeDetail ??
          FaultCodeSlowdownCategoryEnum.PAYMENT_SLOWDOWN_ERROR
      }))
    );
    return <WalletPaymentFailureDetail failure={failure} />;
  }

  if (pot.isSome(paymentDetailsPot)) {
    return (
      <WalletPaymentDetailContent
        rptId={rptId}
        payment={paymentDetailsPot.value}
      />
    );
  }

  return (
    <SafeAreaView style={styles.loadingContainer}>
      <LoadingIndicator
        testID="wallet-payment-detail-loading-indicator"
        size={48}
      />
      <VSpacer size={24} />
      <H3 style={{ textAlign: "center" }}>
        {I18n.t("wallet.firstTransactionSummary.loading")}
      </H3>
    </SafeAreaView>
  );
};

type WalletPaymentDetailContentProps = {
  rptId: RptId;
  payment: PaymentRequestsGetResponse;
};

const WalletPaymentDetailContent = ({
  rptId,
  payment
}: WalletPaymentDetailContentProps) => {
  const dispatch = useIODispatch();
  const paymentAnalyticsData = useIOSelector(paymentAnalyticsDataSelector);
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const paymentDetailsPot = useIOSelector(walletPaymentDetailsSelector);
  const userWalletsPots = useIOSelector(
    walletPaymentEnabledUserWalletsSelector
  );

  useOnFirstRender(() => {
    analytics.trackPaymentSummaryInfoScreen({
      amount: paymentAnalyticsData?.formattedAmount,
      expiration_date: paymentAnalyticsData?.verifiedData?.dueDate,
      organization_name: paymentAnalyticsData?.verifiedData?.paName,
      organization_fiscal_code:
        paymentAnalyticsData?.verifiedData?.paFiscalCode,
      saved_payment_method:
        paymentAnalyticsData?.savedPaymentMethods?.length || 0,
      service_name: paymentAnalyticsData?.serviceName,
      data_entry: paymentAnalyticsData?.startOrigin,
      first_time_opening: !paymentAnalyticsData?.attempt ? "yes" : "no"
    });
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true
    });
  }, [navigation]);

  useHeaderSecondLevel({
    title: "",
    supportRequest: true,
    contextualHelp: emptyContextualHelp
  });

  const navigateToMakePaymentScreen = () => {
    analytics.trackPaymentStartFlow({
      data_entry: paymentAnalyticsData?.startOrigin,
      attempt: paymentAnalyticsData?.attempt,
      organization_name: payment.paName,
      organization_fiscal_code: payment.paFiscalCode,
      service_name: paymentAnalyticsData?.serviceName,
      saved_payment_method:
        paymentAnalyticsData?.savedPaymentMethods?.length || 0,
      amount,
      expiration_date: dueDate
    });
    dispatch(storeNewPaymentAttemptAction(rptId));
    dispatch(
      paymentsGetPaymentUserMethodsAction.request({
        onResponse: wallets => {
          const hasAllPaymentMethodsExpired =
            wallets?.filter(wallet => !isPaymentMethodExpired(wallet.details))
              .length === 0;
          const isWalletEmpty = wallets && wallets.length === 0;
          if (!isWalletEmpty && !hasAllPaymentMethodsExpired) {
            dispatch(
              walletPaymentSetCurrentStep(
                WalletPaymentStepEnum.PICK_PAYMENT_METHOD
              )
            );
            navigation.navigate(
              PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR,
              {
                screen: PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_MAKE
              }
            );
          } else {
            const paymentDetails = pot.toUndefined(paymentDetailsPot);
            dispatch(
              paymentsInitOnboardingWithRptIdToResume({
                rptId: paymentDetails?.rptId
              })
            );
            navigation.navigate(
              PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR,
              {
                screen: PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_OUTCOME,
                params: {
                  outcome: isWalletEmpty
                    ? WalletPaymentOutcomeEnum.PAYMENT_METHODS_NOT_AVAILABLE
                    : WalletPaymentOutcomeEnum.PAYMENT_METHODS_EXPIRED
                }
              }
            );
          }
        }
      })
    );
  };

  const amountInfoBottomSheet = useIOBottomSheetModal({
    title: I18n.t("wallet.firstTransactionSummary.amountInfo.title"),
    component: (
      <SafeAreaView>
        <IOMarkdown
          content={I18n.t("wallet.firstTransactionSummary.amountInfo.message")}
        />
        <VSpacer size={24} />
      </SafeAreaView>
    )
  });

  const description = pipe(
    payment.description,
    O.fromNullable,
    O.map(cleanTransactionDescription),
    O.toUndefined
  );

  const amount = pipe(payment.amount, centsToAmount, amountValue =>
    formatNumberAmount(amountValue, true, "right")
  );

  const dueDate = pipe(
    payment.dueDate,
    O.fromNullable,
    O.map(date => formatAndValidateDueDate(date)),
    O.toUndefined
  );

  const formattedPaymentNoticeNumber = pipe(
    rptId,
    RptIdFromString.decode,
    O.fromEither,
    O.map(({ paymentNoticeNumber }) => paymentNoticeNumber),
    O.map(PaymentNoticeNumberFromString.encode),
    O.map(formatPaymentNoticeNumber),
    O.getOrElse(() => "")
  );

  const orgFiscalCode = pipe(
    rptId,
    RptIdFromString.decode,
    O.fromEither,
    O.map(({ organizationFiscalCode }) => organizationFiscalCode),
    O.map(OrganizationFiscalCode.encode),
    O.getOrElse(() => "")
  );

  const amountEndElement: ComponentProps<typeof ListItemInfo>["endElement"] = {
    type: "iconButton",
    componentProps: {
      testID: "amount-info-icon",
      icon: "info",
      accessibilityLabel: "info",
      onPress: () => {
        amountInfoBottomSheet.present();
        analytics.trackPaymentSummaryAmountInfo({
          amount,
          organization_name: payment.paName,
          organization_fiscal_code: payment.paFiscalCode,
          service_name: description
        });
      }
    }
  };

  const handleOnCopy = (text: string) => {
    clipboardSetStringWithFeedback(text);
    analytics.trackPaymentSummaryNoticeCopy({
      code: text,
      organization_name: payment.paName,
      organization_fiscal_code: payment.paFiscalCode,
      service_name: description,
      expiration_date: dueDate
    });
  };

  return (
    <IOScrollView
      actions={{
        type: "SingleButton",
        primary: {
          label: "Vai al pagamento",
          onPress: navigateToMakePaymentScreen,
          loading: pot.isLoading(userWalletsPots),
          disabled: pot.isLoading(userWalletsPots),
          testID: "wallet-payment-detail-make-payment-button"
        }
      }}
    >
      <ListItemInfo
        testID="wallet-payment-detail-recipient"
        icon={"institution"}
        label={I18n.t("wallet.firstTransactionSummary.recipient")}
        value={payment.paName}
      />
      <Divider />
      <ListItemInfo
        testID="wallet-payment-detail-object"
        icon={"notes"}
        label={I18n.t("wallet.firstTransactionSummary.object")}
        value={description}
        numberOfLines={0}
      />
      <Divider />
      <ListItemInfo
        testID="wallet-payment-detail-amount"
        icon={"psp"}
        label={I18n.t("wallet.firstTransactionSummary.amount")}
        value={amount}
        endElement={amountEndElement}
      />
      <Divider />
      {dueDate && (
        <>
          <ListItemInfo
            icon="calendar"
            label={I18n.t("wallet.firstTransactionSummary.dueDate")}
            value={dueDate}
          />
          <Divider />
        </>
      )}
      <ListItemInfoCopy
        testID="payment-notice-copy-button"
        icon="docPaymentCode"
        label={I18n.t("payment.noticeCode")}
        value={formattedPaymentNoticeNumber}
        onPress={() => handleOnCopy(formattedPaymentNoticeNumber)}
      />
      <Divider />
      <ListItemInfoCopy
        icon="entityCode"
        label={I18n.t("wallet.firstTransactionSummary.entityCode")}
        value={orgFiscalCode}
        onPress={() => handleOnCopy(orgFiscalCode)}
      />
      {amountInfoBottomSheet.bottomSheet}
    </IOScrollView>
  );
};

const loadingContainerHorizontalMargin: IOSpacingScale = 48;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: loadingContainerHorizontalMargin
  }
});

export { WalletPaymentDetailScreen };
export type { WalletPaymentDetailScreenNavigationParams };
