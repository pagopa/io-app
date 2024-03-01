import {
  HeaderFirstLevel,
  IOStyles,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { SafeAreaView, View } from "react-native";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { selectWalletPaymentHistoryArchive } from "../../history/store/selectors";
import { walletPaymentGetUserWallets } from "../../payment/store/actions/networking";
import { walletPaymentUserWalletsSelector } from "../../payment/store/selectors";
import PaymentHistorySection, {
  EmptyPaymentHistorySection
} from "../components/PaymentsHomeScreenHistorySection";
import PaymentMethodsSection from "../components/PaymentsHomeScreenMethodsSection";

/**
 * Home screen for the payment section
 *
 * this screen is divided into Methods and history sections,
 * with their own handled empty states
 * to allow for reusability
 */

export const PaymentsHomeScreen = () => {
  const dispatch = useIODispatch();
  const paymentMethodsPot = useIOSelector(walletPaymentUserWalletsSelector);
  const paymentHistory = useIOSelector(selectWalletPaymentHistoryArchive) ?? [];

  useFocusEffect(
    React.useCallback(() => {
      dispatch(walletPaymentGetUserWallets.request());
    }, [dispatch])
  );

  const paymentMethods = pot.getOrElse(paymentMethodsPot, []);

  const FullPage = () => (
    <>
      <VSpacer size={24} />
      <PaymentMethodsSection
        isLoading={pot.isLoading(paymentMethodsPot)}
        methods={paymentMethods}
      />

      <VSpacer size={24} />
      <View style={[IOStyles.flex, IOStyles.centerJustified]}>
        <PaymentHistorySection history={paymentHistory} />
      </View>
    </>
  );

  const ScreenContent = () => {
    const isHistoryEmpty = paymentHistory.length === 0;
    const areMethodsEmpty =
      paymentMethods.length === 0 && !pot.isLoading(paymentMethodsPot);

    if (isHistoryEmpty && areMethodsEmpty) {
      return <EmptyPage />;
    }
    return <FullPage />;
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HeaderFirstLevel
        title={I18n.t("payment.homeScreen.title")}
        type="singleAction"
        firstAction={{
          accessibilityLabel: I18n.t("payment.homeScreen.title"),
          icon: "help",
          onPress: () => null
        }}
      />
      <ScreenContent />
    </SafeAreaView>
  );
};

const EmptyPage = () => (
  <View style={[IOStyles.flex, IOStyles.centerJustified, IOStyles.alignCenter]}>
    <Pictogram name="empty" />
    <EmptyPaymentHistorySection />
  </View>
);
