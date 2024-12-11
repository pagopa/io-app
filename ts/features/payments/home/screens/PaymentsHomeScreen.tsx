import { IOStyles } from "@pagopa/io-app-design-system";
import * as React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import Animated, { LinearTransition } from "react-native-reanimated";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { PaymentsBarcodeRoutes } from "../../barcode/navigation/routes";
import { PaymentsHomeEmptyScreenContent } from "../components/PaymentsHomeEmptyScreenContent";
import { PaymentsHomeTransactionsList } from "../components/PaymentsHomeTransactionsList";
import { PaymentsHomeUserMethodsList } from "../components/PaymentsHomeUserMethodsList";
import {
  isPaymentsLatestTransactionsEmptySelector,
  isPaymentsSectionEmptySelector,
  isPaymentsSectionLoadingFirstTimeSelector,
  isPaymentsSectionLoadingSelector
} from "../store/selectors";
import { PaymentsAlertStatus } from "../components/PaymentsAlertStatus";
import { getPaymentsWalletUserMethods } from "../../wallet/store/actions";
import { getPaymentsLatestReceiptAction } from "../../receipts/store/actions";
import {
  IOScrollView,
  IOScrollViewActions
} from "../../../../components/ui/IOScrollView";
import * as analytics from "../analytics";
import { paymentAnalyticsDataSelector } from "../../history/store/selectors";
import { paymentsWalletUserMethodsSelector } from "../../wallet/store/selectors";
import { walletLatestReceiptListPotSelector } from "../../receipts/store/selectors";

const PaymentsHomeScreen = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const isLoading = useIOSelector(isPaymentsSectionLoadingSelector);
  const paymentAnalyticsData = useIOSelector(paymentAnalyticsDataSelector);
  const isLoadingFirstTime = useIOSelector(
    isPaymentsSectionLoadingFirstTimeSelector
  );
  const isTransactionsEmpty = useIOSelector(
    isPaymentsLatestTransactionsEmptySelector
  );
  const paymentMethodsPot = useIOSelector(paymentsWalletUserMethodsSelector);
  const latestTransactionsPot = useIOSelector(
    walletLatestReceiptListPotSelector
  );

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const cannotRefresh =
    pot.isError(paymentMethodsPot) &&
    pot.isNone(paymentMethodsPot) &&
    pot.isError(latestTransactionsPot) &&
    pot.isNone(latestTransactionsPot);

  const handleOnPayNoticedPress = () => {
    analytics.trackPaymentStartDataEntry({
      payments_home_status: paymentAnalyticsData?.paymentsHomeStatus,
      saved_payment_method:
        paymentAnalyticsData?.savedPaymentMethods?.length ?? 0
    });
    navigation.navigate(PaymentsBarcodeRoutes.PAYMENT_BARCODE_NAVIGATOR, {
      screen: PaymentsBarcodeRoutes.PAYMENT_BARCODE_SCAN
    });
  };

  React.useEffect(() => {
    if (!isLoading) {
      setIsRefreshing(false);
      analytics.trackPaymentsHome({
        saved_payment_method:
          paymentAnalyticsData?.savedPaymentMethods?.length ?? 0,
        payments_home_status: paymentAnalyticsData?.paymentsHomeStatus
      });
    }
  }, [isLoading, paymentAnalyticsData]);

  const handleRefreshPaymentsHome = () => {
    if (isRefreshing || isLoading || cannotRefresh) {
      return;
    }
    setIsRefreshing(true);
    dispatch(getPaymentsWalletUserMethods.request());
    dispatch(getPaymentsLatestReceiptAction.request());
  };

  const AnimatedPaymentsHomeScreenContent = React.useCallback(
    () => (
      <Animated.View
        style={IOStyles.flex}
        layout={LinearTransition.duration(200)}
      >
        <PaymentsHomeScreenContent />
      </Animated.View>
    ),
    []
  );

  if (isTransactionsEmpty) {
    return (
      <IOScrollView
        contentContainerStyle={{
          flexGrow: 1
        }}
        refreshControlProps={{
          refreshing: isRefreshing,
          onRefresh: handleRefreshPaymentsHome
        }}
      >
        <PaymentsAlertStatus />
        <AnimatedPaymentsHomeScreenContent />
      </IOScrollView>
    );
  }

  const primaryActionProps: IOScrollViewActions["primary"] = {
    label: I18n.t("features.payments.cta"),
    onPress: handleOnPayNoticedPress,
    icon: "qrCode",
    iconPosition: "end",
    testID: "PaymentsHomeScreenTestID-cta"
  };

  return (
    <IOScrollView
      refreshControlProps={{
        refreshing: isRefreshing,
        onRefresh: handleRefreshPaymentsHome
      }}
      actions={
        !isLoadingFirstTime
          ? {
              type: "SingleButton",
              primary: primaryActionProps
            }
          : undefined
      }
      excludeSafeAreaMargins={true}
    >
      <PaymentsAlertStatus />
      <AnimatedPaymentsHomeScreenContent />
    </IOScrollView>
  );
};

const PaymentsHomeScreenContent = () => {
  const isLoadingFirstTime = useIOSelector(
    isPaymentsSectionLoadingFirstTimeSelector
  );
  const isEmpty = useIOSelector(isPaymentsSectionEmptySelector);
  const userMethodsPot = useIOSelector(paymentsWalletUserMethodsSelector);
  const latestTransactionsPot = useIOSelector(
    walletLatestReceiptListPotSelector
  );

  if (
    isEmpty &&
    !pot.isError(userMethodsPot) &&
    !pot.isError(latestTransactionsPot)
  ) {
    return <PaymentsHomeEmptyScreenContent withPictogram={true} />;
  }

  return (
    <>
      <PaymentsHomeUserMethodsList enforcedLoadingState={isLoadingFirstTime} />
      <PaymentsHomeTransactionsList enforcedLoadingState={isLoadingFirstTime} />
    </>
  );
};

export { PaymentsHomeScreen };
