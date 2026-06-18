import { ContentWrapper } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import Animated, {
  LinearTransition,
  useAnimatedRef
} from "react-native-reanimated";
import I18n from "i18next";
import {
  IOScrollView,
  IOScrollViewActions
} from "../../../../components/ui/IOScrollView";
import { useHeaderFirstLevel } from "../../../../hooks/useHeaderFirstLevel";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { PaymentsBarcodeRoutes } from "../../barcode/navigation/routes";
import { paymentAnalyticsDataSelector } from "../../history/store/selectors";
import { getPaymentsLatestReceiptAction } from "../../receipts/store/actions";
import { walletLatestReceiptListPotSelector } from "../../receipts/store/selectors";
import { getPaymentsWalletUserMethods } from "../../wallet/store/actions";
import { paymentsWalletUserMethodsSelector } from "../../wallet/store/selectors";
import * as analytics from "../analytics";
import { PaymentsAlertStatus } from "../components/PaymentsAlertStatus";
import { PaymentsHomeEmptyScreenContent } from "../components/PaymentsHomeEmptyScreenContent";
import { PaymentsHomeTransactionsList } from "../components/PaymentsHomeTransactionsList";
import { PaymentsHomeUserMethodsList } from "../components/PaymentsHomeUserMethodsList";
import {
  isPaymentsLatestTransactionsEmptySelector,
  isPaymentsSectionEmptySelector,
  isPaymentsSectionLoadingFirstTimeSelector,
  isPaymentsSectionLoadingSelector
} from "../store/selectors";

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

  const [isRefreshing, setIsRefreshing] = useState(false);
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

  /* CODE RELATED TO THE HEADER -- START */

  const scrollViewContentRef = useAnimatedRef<Animated.ScrollView>();

  useHeaderFirstLevel({
    currentRoute: ROUTES.PAYMENTS_HOME,
    headerProps: {
      title: I18n.t("features.payments.title"),
      animatedRef: scrollViewContentRef
    }
  });

  /* CODE RELATED TO THE HEADER -- END */

  useFocusEffect(
    useCallback(() => {
      if (!isLoading) {
        setIsRefreshing(false);
        analytics.trackPaymentsHome({
          saved_payment_method:
            paymentAnalyticsData?.savedPaymentMethods?.length ?? 0,
          payments_home_status: paymentAnalyticsData?.paymentsHomeStatus
        });
      }
    }, [
      isLoading,
      paymentAnalyticsData?.paymentsHomeStatus,
      paymentAnalyticsData?.savedPaymentMethods?.length
    ])
  );

  const handleRefreshPaymentsHome = () => {
    if (isRefreshing || isLoading || cannotRefresh) {
      return;
    }
    setIsRefreshing(true);
    dispatch(getPaymentsWalletUserMethods.request());
    dispatch(getPaymentsLatestReceiptAction.request());
  };

  const AnimatedPaymentsHomeScreenContent = useCallback(
    () => (
      <Animated.View
        style={{ flex: 1 }}
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
        includeContentMargins={false}
        animatedRef={scrollViewContentRef}
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
      includeContentMargins={false}
      excludeSafeAreaMargins={true}
      animatedRef={scrollViewContentRef}
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
      <ContentWrapper>
        <PaymentsHomeUserMethodsList
          enforcedLoadingState={isLoadingFirstTime}
        />
      </ContentWrapper>
      <PaymentsHomeTransactionsList enforcedLoadingState={isLoadingFirstTime} />
    </>
  );
};

export { PaymentsHomeScreen };
