import { IOStyles } from "@pagopa/io-app-design-system";
import * as React from "react";
import Animated, { Layout } from "react-native-reanimated";
import { ScrollView } from "react-native";
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
import { getPaymentsLatestBizEventsTransactionsAction } from "../../bizEventsTransaction/store/actions";
import {
  IOScrollView,
  IOScrollViewActions
} from "../../../../components/ui/IOScrollView";
import * as analytics from "../analytics";
import { paymentAnalyticsDataSelector } from "../../history/store/selectors";

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

  const [isRefreshing, setIsRefreshing] = React.useState(false);

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
    setIsRefreshing(true);
    dispatch(getPaymentsWalletUserMethods.request());
    dispatch(getPaymentsLatestBizEventsTransactionsAction.request());
  };

  const AnimatedPaymentsHomeScreenContent = React.useCallback(
    () => (
      <Animated.View style={IOStyles.flex} layout={Layout.duration(200)}>
        <PaymentsHomeScreenContent />
      </Animated.View>
    ),
    []
  );

  if (isTransactionsEmpty) {
    return (
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          flexGrow: 1
        }}
      >
        <PaymentsAlertStatus />
        <AnimatedPaymentsHomeScreenContent />
      </ScrollView>
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

  if (isEmpty) {
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
