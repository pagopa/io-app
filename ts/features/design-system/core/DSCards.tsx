import * as React from "react";
import { Alert, StyleSheet, View } from "react-native";
import { HSpacer, VSpacer } from "@pagopa/io-app-design-system";
import { PaymentCardBig } from "../../../components/ui/cards/payment/PaymentCardBig";
import { PaymentCardSmall } from "../../../components/ui/cards/payment/PaymentCardSmall";
import {
  PaymentCardsCarousel,
  PaymentCardsCarouselProps
} from "../../../components/ui/cards/payment/PaymentCardsCarousel";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { IdPayWalletCard } from "../../idpay/wallet/components/IdPayWalletCard";

const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  }
});

const onPress = () => {
  Alert.alert("Alert", "Action triggered");
};

const cardsDataForCarousel: PaymentCardsCarouselProps = {
  cards: [
    {
      isLoading: true
    },
    {
      cardType: "CREDIT",
      hpan: "9999",
      isError: false,
      cardIcon: "maestro",
      onCardPress: onPress
    },
    {
      cardType: "PAYPAL",
      isError: true,
      onCardPress: onPress
    },
    {
      cardType: "BANCOMATPAY",
      onCardPress: onPress
    },
    {
      cardType: "PAGOBANCOMAT",
      providerName: "banca intesa",
      onCardPress: onPress
    },
    {
      cardType: "CREDIT",
      hpan: "9999",
      isError: true,
      onCardPress: onPress
    },
    {
      cardType: "COBADGE",
      providerName: "banca intesa",
      cardIcon: "maestro",
      onCardPress: onPress
    }
  ]
};

// for testing reasons, abi codes can be found here:
// https://www.comuniecitta.it/elenco-banche-per-codice-abi
export const DSCards = () => (
  <DesignSystemScreen title={"Cards"}>
    <DSComponentViewerBox name="PaymentCardSmall">
      <View style={styles.content}>
        <PaymentCardSmall hpan="9999" isError={false} cardType={"CREDIT"} />
        <HSpacer size={16} />
        <PaymentCardSmall cardType="PAYPAL" />
      </View>
      <VSpacer size={16} />
      <View style={styles.content}>
        <PaymentCardSmall
          cardType={"COBADGE"}
          isError={true}
          providerName="A very very long name for a provider"
          cardIcon="maestro"
          onCardPress={onPress}
        />
        <HSpacer size={16} />
        <PaymentCardSmall
          cardType={"BANCOMATPAY"}
          isError={true}
          onCardPress={onPress}
        />
      </View>
      <VSpacer size={16} />
      <View style={styles.content}>
        <PaymentCardSmall isLoading={true} />

        <HSpacer size={16} />

        <PaymentCardSmall isLoading={true} />
      </View>
    </DSComponentViewerBox>
    <DSComponentViewerBox
      name="PaymentCardBig
"
    >
      <PaymentCardBig
        hpan="9999"
        cardType={"CREDIT"}
        holderName="Mario Rossi"
        cardIcon="mastercard"
        expirationDate={new Date()}
      />
      <VSpacer size={16} />
      <PaymentCardBig
        cardType={"PAGOBANCOMAT"}
        expirationDate={new Date()}
        holderName="A very very very long citizen name"
        abiCode="03069"
      />
      <VSpacer size={16} />
      <PaymentCardBig
        cardType={"PAYPAL"}
        holderEmail="userPaypalEmail@email.com"
      />
      <VSpacer size={16} />
      <PaymentCardBig
        cardType={"COBADGE"}
        holderName="Mario Rossi"
        abiCode="08509"
        expirationDate={new Date()}
        cardIcon="visa"
      />
      <VSpacer size={16} />
      <PaymentCardBig
        cardType={"COBADGE"}
        holderName="Mario Rossi"
        abiCode="08508"
        expirationDate={new Date()}
        cardIcon="visa"
      />
      <VSpacer size={16} />
      <PaymentCardBig
        cardType={"BANCOMATPAY"}
        holderName="Mario Rossi"
        phoneNumber="+39 1234567890"
      />
      <VSpacer size={16} />
      <PaymentCardBig isLoading={true} />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="PaymentCardsCarousel">
      <PaymentCardsCarousel {...cardsDataForCarousel} />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="IdPayWalletCard">
      <IdPayWalletCard
        name="18 app"
        amount={9999}
        avatarSource={{
          uri: "https://vtlogo.com/wp-content/uploads/2021/08/18app-vector-logo.png"
        }}
        expireDate={new Date()}
      />
    </DSComponentViewerBox>
  </DesignSystemScreen>
);
