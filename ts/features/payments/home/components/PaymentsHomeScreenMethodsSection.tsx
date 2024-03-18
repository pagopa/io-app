import { IOStyles, ListItemHeader } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { WalletInfo } from "../../../../../definitions/pagopa/ecommerce/WalletInfo";
import { PaymentCardSmallProps } from "../../../../components/ui/cards/payment/PaymentCardSmall";
import { PaymentCardsCarousel } from "../../../../components/ui/cards/payment/PaymentCardsCarousel";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { UIWalletInfoDetails } from "../../details/types/UIWalletInfoDetails";
import { walletPaymentUserWalletsSelector } from "../../payment/store/selectors";

const loadingCards: Array<PaymentCardSmallProps> = Array.from({
  length: 3
}).map(() => ({
  isLoading: true
}));

type PaymentMethodsSectionProps = {
  isLoading?: boolean;
};

const PaymentMethodsSection = ({ isLoading }: PaymentMethodsSectionProps) => {
  const paymentMethodsPot = useIOSelector(walletPaymentUserWalletsSelector);
  const isLoadingSection = isLoading || pot.isLoading(paymentMethodsPot);
  const methods = pot.getOrElse(paymentMethodsPot, []);

  const mapMethods = (
    // this function is here to allow future navigation usage
    method: NonNullable<WalletInfo>
  ): PaymentCardSmallProps | undefined => {
    const details = method.details as UIWalletInfoDetails;

    if (details.maskedPan !== undefined) {
      return {
        cardType: "CREDIT",
        hpan: details.maskedPan,
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

  return (
    <View style={IOStyles.horizontalContentPadding}>
      <ListItemHeader
        label={I18n.t("payment.homeScreen.methodsSection.header")}
        accessibilityLabel={I18n.t("payment.homeScreen.methodsSection.header")}
        endElement={{
          type: "buttonLink",
          componentProps: {
            label: I18n.t("payment.homeScreen.methodsSection.headerCTA"),
            onPress: () => null
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
