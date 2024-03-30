import { IOStyles, ListItemHeader } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { WalletInfo } from "../../../../../definitions/pagopa/ecommerce/WalletInfo";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { UIWalletInfoDetails } from "../../details/types/UIWalletInfoDetails";
import { walletPaymentUserWalletsSelector } from "../../checkout/store/selectors";
import { PaymentCardSmallProps } from "../../common/components/PaymentCardSmall";
import { PaymentCardsCarousel } from "../../common/components/PaymentCardsCarousel";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { PaymentsOnboardingRoutes } from "../../onboarding/navigation/routes";

const loadingCards: Array<PaymentCardSmallProps> = Array.from({
  length: 3
}).map(() => ({
  isLoading: true
}));

type PaymentMethodsSectionProps = {
  isLoading?: boolean;
};

const PaymentMethodsSection = ({ isLoading }: PaymentMethodsSectionProps) => {
  const navigation = useIONavigation();
  const paymentMethodsPot = useIOSelector(walletPaymentUserWalletsSelector);
  const isLoadingSection = isLoading || pot.isLoading(paymentMethodsPot);
  const methods = pot.getOrElse(paymentMethodsPot, []);

  const mapMethods = (
    // this function is here to allow future navigation usage
    method: NonNullable<WalletInfo>
  ): PaymentCardSmallProps | undefined => {
    const details = method.details as UIWalletInfoDetails;

    if (details.lastFourDigits !== undefined) {
      return {
        cardType: "CREDIT",
        hpan: details.lastFourDigits,
        cardIcon: details.brand,
        isLoading: false
      };
    }
    if (details.maskedEmail !== undefined) {
      return {
        cardType: "PAYPAL"
      };
    }
    if (details.maskedNumber !== undefined) {
      return {
        cardType: "BANCOMATPAY"
      };
    }
    return undefined;
  };

  const renderMethods = isLoadingSection
    ? loadingCards
    : methods
        .map(mapMethods)
        .filter((item): item is PaymentCardSmallProps => item !== undefined) ??
      loadingCards;

  const handleOnAddMethodPress = () => {
    navigation.navigate(PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_NAVIGATOR, {
      screen: PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_SELECT_METHOD
    });
  };

  return (
    <View style={IOStyles.horizontalContentPadding}>
      <ListItemHeader
        label={I18n.t("payment.homeScreen.methodsSection.header")}
        accessibilityLabel={I18n.t("payment.homeScreen.methodsSection.header")}
        endElement={{
          type: "buttonLink",
          componentProps: {
            label: I18n.t("payment.homeScreen.methodsSection.headerCTA"),
            onPress: handleOnAddMethodPress
          }
        }}
      />
      <View style={styles.fixedCardsHeight}>
        <PaymentCardsCarousel cards={renderMethods} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fixedCardsHeight: { height: 96 }
});

export default PaymentMethodsSection;
