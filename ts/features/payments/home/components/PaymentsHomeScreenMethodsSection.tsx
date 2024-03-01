import { Banner, IOStyles, ListItemHeader } from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { PaymentCardSmallProps } from "../../../../components/ui/cards/payment/PaymentCardSmall";
import { PaymentCardsCarousel } from "../../../../components/ui/cards/payment/PaymentCardsCarousel";
import I18n from "../../../../i18n";
import { UIWalletInfoDetails } from "../../details/types/UIWalletInfoDetails";
import { WalletInfo } from "../../../../../definitions/pagopa/ecommerce/WalletInfo";

type PaymentMethodsSectionProps = {
  methods: ReadonlyArray<WalletInfo>;
  isLoading?: boolean;
};

const PaymentMethodsSection = ({
  methods,
  isLoading
}: PaymentMethodsSectionProps) => {
  const renderMethods = isLoading ? loadingCards : methods.map(mapMethods);

  const shouldRenderEmpty = renderMethods.length === 0;

  const FullPaymentMethods = () => (
    <>
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
    </>
  );

  return (
    <View style={IOStyles.horizontalContentPadding}>
      {shouldRenderEmpty ? <EmptyPaymentMethods /> : <FullPaymentMethods />}
    </View>
  );
};

const EmptyPaymentMethods = () => {
  const viewRef = React.useRef(null);
  return (
    <Banner
      color="neutral"
      pictogramName="cardAdd"
      viewRef={viewRef}
      size="big"
      onClose={() => null}
      labelClose="CLOSE"
      content={I18n.t("payment.homeScreen.methodsSection.empty.body")}
      action={I18n.t("payment.homeScreen.methodsSection.empty.cta")}
      onPress={() => null}
    />
  );
};

// ----------------------------  UTILS ---------------------------- //

const loadingCards: Array<PaymentCardSmallProps> = Array.from({
  length: 3
}).map(() => ({
  isLoading: true
}));

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

// ----------------------------  STYLES & EXPORT ---------------------------- //

const styles = StyleSheet.create({
  fixedCardsHeight: { height: 96 }
});

export default PaymentMethodsSection;
