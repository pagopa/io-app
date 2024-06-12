import { constVoid } from "fp-ts/lib/function";
import { Alert, GradientScrollView } from "@pagopa/io-app-design-system";
import * as React from "react";
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
import { LevelEnum } from "../../../../../definitions/content/SectionStatus";
import { getFullLocale } from "../../../../utils/locale";
import { openWebUrl } from "../../../../utils/url";

type AlertVariant = "error" | "success" | "warning" | "info";

const getAlertVariant = (level: LevelEnum): AlertVariant => {
  switch (level) {
    case LevelEnum.critical:
      return "error";
    case LevelEnum.normal:
      return "info";
    case LevelEnum.warning:
      return "warning";
    default:
      return "info";
  }
};

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

  if (isTransactionsEmpty) {
    return (
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          flexGrow: 1
        }}
      >
        <PaymentsHomeScreenContent />
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
      <PaymentsHomeScreenContent />
    </GradientScrollView>
  );
};

const PaymentsHomeScreenContent = () => {
  const isLoading = useIOSelector(isPaymentsSectionLoadingSelector);
  const isEmpty = useIOSelector(isPaymentsSectionEmptySelector);
  const alertInfo = useIOSelector(sectionStatusSelector("wallets"));

  const isAlertVisible = alertInfo && alertInfo.is_visible;

  const handleOnPressAlertStatusInfo = (_: GestureResponderEvent) => {
    if (alertInfo && alertInfo.web_url && alertInfo.web_url[getFullLocale()]) {
      openWebUrl(alertInfo.web_url[getFullLocale()]);
    }
  };

  const PaymentsBodyContent = () => {
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

  const AlertStatusInfo = () => {
    if (!alertInfo || !isAlertVisible) {
      return null;
    }
    const actionLabel = alertInfo.web_url
      ? I18n.t("features.payments.remoteAlert.cta")
      : undefined;
    return (
      <Alert
        content={alertInfo.message[getFullLocale()]}
        variant={getAlertVariant(alertInfo.level)}
        action={actionLabel}
        onPress={
          alertInfo.web_url ? handleOnPressAlertStatusInfo : () => constVoid
        }
      />
    );
  };

  return (
    <>
      <AlertStatusInfo />
      <PaymentsBodyContent />
    </>
  );
};

export { PaymentsHomeScreen };
