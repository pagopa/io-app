import { IOStyles } from "@pagopa/io-app-design-system";
import * as React from "react";
import { useCallback, useLayoutEffect } from "react";
import Animated, {
  LinearTransition,
  useAnimatedRef
} from "react-native-reanimated";
import HeaderFirstLevel from "../../../../components/ui/HeaderFirstLevel";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useHeaderFirstLevelActionPropHelp } from "../../../../hooks/useHeaderFirstLevelActionPropHelp";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIOSelector } from "../../../../store/hooks";
import { isSettingsVisibleAndHideProfileSelector } from "../../../../store/reducers/backendStatus";
import { PaymentsBarcodeRoutes } from "../../barcode/navigation/routes";
import { PaymentsAlertStatus } from "../components/PaymentsAlertStatus";
import { PaymentsHomeEmptyScreenContent } from "../components/PaymentsHomeEmptyScreenContent";
import { PaymentsHomeTransactionsList } from "../components/PaymentsHomeTransactionsList";
import { PaymentsHomeUserMethodsList } from "../components/PaymentsHomeUserMethodsList";
import {
  isPaymentsLatestTransactionsEmptySelector,
  isPaymentsSectionEmptySelector,
  isPaymentsSectionLoadingSelector
} from "../store/selectors";
import { useHeaderFirstLevelActionPropSettings } from "../../../../navigation/components/HeaderFirstLevelHandler";

const PaymentsHomeScreen = () => {
  const navigation = useIONavigation();

  const isLoading = useIOSelector(isPaymentsSectionLoadingSelector);
  const isTransactionsEmpty = useIOSelector(
    isPaymentsLatestTransactionsEmptySelector
  );

  const handleOnPayNoticedPress = () => {
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

  const AnimatedPaymentsHomeScreenContent = useCallback(
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

  return (
    <IOScrollView
      animatedRef={scrollViewContentRef}
      excludeSafeAreaMargins={true}
      actions={
        isLoading
          ? undefined
          : {
              type: "SingleButton",
              primary: {
                label: I18n.t("features.payments.cta"),
                icon: "qrCode",
                iconPosition: "end",
                onPress: handleOnPayNoticedPress,
                testID: "PaymentsHomeScreenTestID-cta"
              }
            }
      }
    >
      <PaymentsAlertStatus />
      <AnimatedPaymentsHomeScreenContent />
    </IOScrollView>
  );
};

const PaymentsHomeScreenContent = () => {
  const isLoading = useIOSelector(isPaymentsSectionLoadingSelector);
  const isEmpty = useIOSelector(isPaymentsSectionEmptySelector);

  if (isEmpty) {
    return <PaymentsHomeEmptyScreenContent withPictogram={true} />;
  }

  return (
    <>
      <PaymentsHomeUserMethodsList enforcedLoadingState={isLoading} />
      <PaymentsHomeTransactionsList enforcedLoadingState={isLoading} />
    </>
  );
};

export { PaymentsHomeScreen };
