import { IOStyles } from "@pagopa/io-app-design-system";
import * as React from "react";
import { useLayoutEffect } from "react";
import Animated, { Layout, useAnimatedRef } from "react-native-reanimated";
import HeaderFirstLevel from "../../../../components/ui/HeaderFirstLevel";
import {
  IOScrollView,
  IOScrollViewActions
} from "../../../../components/ui/IOScrollView";
import { useHeaderFirstLevelActionPropHelp } from "../../../../hooks/useHeaderFirstLevelActionPropHelp";
import I18n from "../../../../i18n";
import { useHeaderFirstLevelActionPropSettings } from "../../../../navigation/components/HeaderFirstLevelHandler";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isSettingsVisibleAndHideProfileSelector } from "../../../../store/reducers/backendStatus";
import { PaymentsBarcodeRoutes } from "../../barcode/navigation/routes";
import { getPaymentsLatestBizEventsTransactionsAction } from "../../bizEventsTransaction/store/actions";
import { paymentAnalyticsDataSelector } from "../../history/store/selectors";
import { getPaymentsWalletUserMethods } from "../../wallet/store/actions";
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

  /* CODE RELATED TO THE HEADER */
  const scrollViewContentRef = useAnimatedRef<Animated.ScrollView>();

  const isSettingsVisibleAndHideProfile = useIOSelector(
    isSettingsVisibleAndHideProfileSelector
  );

  const helpAction = useHeaderFirstLevelActionPropHelp(ROUTES.PAYMENTS_HOME);
  const settingsAction = useHeaderFirstLevelActionPropSettings();

  useLayoutEffect(() => {
    const headerFirstLevelProps: HeaderFirstLevel = {
      title: I18n.t("features.payments.title"),
      animatedRef: scrollViewContentRef,
      firstAction: helpAction,
      ...(isSettingsVisibleAndHideProfile
        ? {
            type: "twoActions",
            secondAction: settingsAction
          }
        : { type: "singleAction" })
    };

    navigation.setOptions({
      header: () => <HeaderFirstLevel {...headerFirstLevelProps} />
    });
  }, [
    scrollViewContentRef,
    settingsAction,
    helpAction,
    isSettingsVisibleAndHideProfile,
    navigation
  ]);

  const AnimatedPaymentsHomeScreenContent = React.useCallback(
    () => (
      <Animated.View style={IOStyles.flex} layout={Layout.duration(200)}>
        <PaymentsHomeScreenContent />
      </Animated.View>
    ),
    []
  );

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

  if (isTransactionsEmpty) {
    return (
      <Animated.ScrollView
        ref={scrollViewContentRef}
        contentContainerStyle={{
          paddingHorizontal: 24,
          flexGrow: 1
        }}
      >
        <PaymentsAlertStatus />
        <AnimatedPaymentsHomeScreenContent />
      </Animated.ScrollView>
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
