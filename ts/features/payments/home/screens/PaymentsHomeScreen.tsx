import { constVoid } from "fp-ts/lib/function";
import { Alert, GradientScrollView } from "@pagopa/io-app-design-system";
import * as React from "react";
import Animated, { FadeIn, Layout } from "react-native-reanimated";
import { GestureResponderEvent, ScrollView } from "react-native";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { PaymentsBarcodeRoutes } from "../../barcode/navigation/routes";
import { PaymentsHomeEmptyScreenContent } from "../components/PaymentsHomeEmptyScreenContent";
import { PaymentsHomeTransactionsList } from "../components/PaymentsHomeTransactionsList";
import { PaymentsHomeUserMethodsList } from "../components/PaymentsHomeUserMethodsList";
import {
  isPaymentsLatestTransactionsEmptySelector,
  isPaymentsSectionEmptySelector,
  isPaymentsSectionLoadingSelector
} from "../store/selectors";
import { sectionStatusSelector } from "../../../../store/reducers/backendStatus";
import { getFullLocale } from "../../../../utils/locale";
import { openWebUrl } from "../../../../utils/url";
import { getAlertVariant } from "../../common/utils";

const PaymentsHomeScreen = () => {
  const navigation = useIONavigation();

  const isLoading = useIOSelector(isPaymentsSectionLoadingSelector);
  const isTransactionsEmpty = useIOSelector(
    isPaymentsLatestTransactionsEmptySelector
  );
  const alertInfo = useIOSelector(sectionStatusSelector("wallets"));
  const alertAnimatedRef = React.useRef(false);

  const AnimatedAlertStatusInfo = React.useCallback(() => {
    if (!alertInfo || !alertInfo.is_visible || isLoading) {
      return null;
    }

    // eslint-disable-next-line functional/immutable-data
    alertAnimatedRef.current = true;

    const handleOnPressAlertStatusInfo = (_: GestureResponderEvent) => {
      if (
        alertInfo &&
        alertInfo.web_url &&
        alertInfo.web_url[getFullLocale()]
      ) {
        openWebUrl(alertInfo.web_url[getFullLocale()]);
      }
    };

    const actionLabel = alertInfo.web_url
      ? I18n.t("features.payments.remoteAlert.cta")
      : undefined;

    return (
      <Animated.View
        entering={!alertAnimatedRef.current ? FadeIn.duration(200) : undefined}
        layout={Layout.duration(200)}
      >
        <Alert
          content={alertInfo.message[getFullLocale()]}
          variant={getAlertVariant(alertInfo.level)}
          action={actionLabel}
          onPress={
            alertInfo.web_url ? handleOnPressAlertStatusInfo : () => constVoid
          }
        />
      </Animated.View>
    );
  }, [alertInfo, isLoading]);

  const handleOnPayNoticedPress = () => {
    navigation.navigate(PaymentsBarcodeRoutes.PAYMENT_BARCODE_NAVIGATOR, {
      screen: PaymentsBarcodeRoutes.PAYMENT_BARCODE_SCAN
    });
  };

  const AnimatedPaymentsHomeScreenContent = React.useCallback(
    () => (
      <Animated.View layout={Layout.duration(200)}>
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
        <AnimatedAlertStatusInfo />
        <AnimatedPaymentsHomeScreenContent />
      </ScrollView>
    );
  }

  return (
    <GradientScrollView
      primaryActionProps={
        isLoading
          ? undefined
          : {
              accessibilityLabel: I18n.t("features.payments.cta"),
              label: I18n.t("features.payments.cta"),
              onPress: handleOnPayNoticedPress,
              icon: "qrCode",
              iconPosition: "end",
              testID: "PaymentsHomeScreenTestID-cta"
            }
      }
      excludeSafeAreaMargins={true}
    >
      <AnimatedAlertStatusInfo />
      <AnimatedPaymentsHomeScreenContent />
    </GradientScrollView>
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
