import { IOStyles, ListItemHeader } from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { PaymentCardSmallProps } from "../../../../components/ui/cards/payment/PaymentCardSmall";
import { PaymentCardsCarousel } from "../../../../components/ui/cards/payment/PaymentCardsCarousel";
import I18n from "../../../../i18n";
import { UIWalletInfoDetails } from "../../details/types/UIWalletInfoDetails";
import { WalletInfo } from "../../../../../definitions/pagopa/ecommerce/WalletInfo";

const loadingCards: Array<PaymentCardSmallProps> = Array.from({
  length: 3
}).map(() => ({
  isLoading: true
}));

type PaymentMethodsSectionProps = {
  methods: ReadonlyArray<WalletInfo>;
  isLoading?: boolean;
};

const PaymentMethodsSection = ({
  methods,
  isLoading
}: PaymentMethodsSectionProps) => {
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

  const renderMethods = isLoading ? loadingCards : methods.map(mapMethods);

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
