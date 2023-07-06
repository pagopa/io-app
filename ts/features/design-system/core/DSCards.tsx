import * as React from "react";
import { Alert, StyleSheet, View } from "react-native";
import { HSpacer, VSpacer } from "../../../components/core/spacer/Spacer";
import { PaymentCardBig } from "../../../components/ui/cards/payment/PaymentCardBig";
import { PaymentCardSmall } from "../../../components/ui/cards/payment/PaymentCardSmall";
import {
  PaymentCardsCarousel,
  PaymentCardsCarouselProps
} from "../../../components/ui/cards/payment/PaymentCardsCarousel";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

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
          cardType={"CREDIT"}
          hpan="9999"
          isError={true}
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
        <PaymentCardSmall
          cardType={"CREDIT"}
          hpan="9999"
          isError={true}
          onCardPress={onPress}
          isLoading={true}
        />
        <HSpacer size={16} />
        <PaymentCardSmall
          cardType={"BANCOMATPAY"}
          isError={true}
          onCardPress={onPress}
          isLoading={true}
        />
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
        holderName="Mario Rossi"
        abiCode="12345"
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
        abiCode="12345"
        expirationDate={new Date()}
        cardIcon="visa"
      />
      <VSpacer size={16} />
      <PaymentCardBig
        cardType={"BANCOMATPAY"}
        expirationDate={new Date()}
        holderName="Mario Rossi"
        phoneNumber="+39 1234567890"
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="PaymentCardsCarousel">
      <PaymentCardsCarousel {...cardsDataForCarousel} />
    </DSComponentViewerBox>
  </DesignSystemScreen>
);
